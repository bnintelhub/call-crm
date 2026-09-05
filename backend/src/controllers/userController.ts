import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { pool } from '../config/db.js';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD', 'TELECALLER']),
  phone: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  employeeId: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS_MANAGER', 'TEAM_LEAD', 'TELECALLER']).optional(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  status: z.string().optional(),
  password: z.string().min(6).optional(),
  employeeId: z.string().optional().nullable(),
});

export const userController = {
  // GET /api/users
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = req.user;
      let query = `
        SELECT 
          u.id, u.employee_id, u.name, u.email, u.role, u.phone, 
          u.company_id, u.is_active, u.status, u.token_version,
          u.last_login_at, u.last_login_ip, u.failed_login_attempts,
          u.profile_pic, u.created_at,
          c.name AS company_name
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
      `;
      const params: any[] = [];
      const conditions: string[] = [];

      // Multi-tenant scoping: Non-superadmins only see users within their company
      if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.companyId) {
        conditions.push('u.company_id = ?');
        params.push(currentUser.companyId);
      }

      // Filter by role query parameter if provided
      if (req.query.role) {
        conditions.push('u.role = ?');
        params.push(req.query.role);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY u.created_at DESC';

      const [rows]: any = await pool.query(query, params);
      res.status(200).json(rows);
    } catch (err: any) {
      console.error('[USER LIST ERROR]', err);
      res.status(500).json({ error: 'Failed to list users.', code: 'SERVER_ERROR' });
    }
  },

  // GET /api/users/telecallers
  getTelecallers: async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = req.user;
      let query = `
        SELECT 
          u.id, u.employee_id, u.name, u.email, u.phone, 
          u.company_id, u.is_active, u.status, u.profile_pic
        FROM users u
        WHERE u.role = 'TELECALLER'
      `;
      const params: any[] = [];

      if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.companyId) {
        query += ' AND u.company_id = ?';
        params.push(currentUser.companyId);
      }

      query += ' ORDER BY u.name ASC';

      const [rows]: any = await pool.query(query, params);
      res.status(200).json(rows);
    } catch (err: any) {
      console.error('[USER TELECALLERS ERROR]', err);
      res.status(500).json({ error: 'Failed to fetch telecallers.', code: 'SERVER_ERROR' });
    }
  },

  // POST /api/users
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ 
          error: validation.error.issues[0]?.message || 'Validation error', 
          code: 'VALIDATION_ERROR' 
        });
        return;
      }

      const { name, email, password, role, phone, companyId, employeeId, isActive } = validation.data;
      const normalizedEmail = email.trim().toLowerCase();

      // Check for duplicate email
      const [existing]: any = await pool.query('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1', [normalizedEmail]);
      if (existing && existing.length > 0) {
        res.status(409).json({ error: 'Email is already registered to another user.', code: 'EMAIL_EXISTS' });
        return;
      }

      const id = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(password, 10);
      const targetCompanyId = companyId || req.user?.companyId || null;

      await pool.query(
        `INSERT INTO users (
          id, employee_id, name, email, password_hash, role, phone, company_id, is_active, status, token_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          id,
          employeeId || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
          name.trim(),
          normalizedEmail,
          passwordHash,
          role,
          phone || null,
          targetCompanyId,
          isActive ? 1 : 0,
          isActive ? 'ACTIVE' : 'DEACTIVATED',
        ]
      );

      res.status(201).json({
        message: 'User created successfully.',
        user: {
          id,
          name,
          email: normalizedEmail,
          role,
          companyId: targetCompanyId,
          isActive,
        },
      });
    } catch (err: any) {
      console.error('[USER CREATE ERROR]', err);
      res.status(500).json({ error: 'Failed to create user.', code: 'SERVER_ERROR' });
    }
  },

  // PUT /api/users/:id
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ 
          error: validation.error.issues[0]?.message || 'Validation error', 
          code: 'VALIDATION_ERROR' 
        });
        return;
      }

      const updates = validation.data;
      const setClauses: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        setClauses.push('name = ?');
        values.push(updates.name.trim());
      }
      if (updates.email !== undefined) {
        setClauses.push('email = ?');
        values.push(updates.email.trim().toLowerCase());
      }
      if (updates.role !== undefined) {
        setClauses.push('role = ?');
        values.push(updates.role);
      }
      if (updates.phone !== undefined) {
        setClauses.push('phone = ?');
        values.push(updates.phone);
      }
      if (updates.employeeId !== undefined) {
        setClauses.push('employee_id = ?');
        values.push(updates.employeeId);
      }

      // ─── Account Deactivation Security Guard ───
      // When deactivating a user (isActive: false or status: 'DEACTIVATED'):
      // 1. Mark is_active = 0 and status = 'DEACTIVATED'
      // 2. Increment token_version = token_version + 1 to IMMEDIATELY revoke all active JWT tokens!
      if (updates.isActive !== undefined) {
        setClauses.push('is_active = ?');
        values.push(updates.isActive ? 1 : 0);

        if (!updates.isActive) {
          setClauses.push("status = 'DEACTIVATED'");
          setClauses.push('token_version = token_version + 1');
        } else {
          setClauses.push("status = 'ACTIVE'");
          setClauses.push('failed_login_attempts = 0');
          setClauses.push('locked_until = NULL');
        }
      }

      if (updates.status !== undefined && updates.isActive === undefined) {
        setClauses.push('status = ?');
        values.push(updates.status);
        if (updates.status === 'DEACTIVATED' || updates.status === 'SUSPENDED') {
          setClauses.push('is_active = 0');
          setClauses.push('token_version = token_version + 1'); // instant session invalidation
        }
      }

      if (updates.password) {
        const hash = await bcrypt.hash(updates.password, 10);
        setClauses.push('password_hash = ?');
        values.push(hash);
        setClauses.push('token_version = token_version + 1'); // revoke existing tokens on password change
      }

      if (setClauses.length === 0) {
        res.status(400).json({ error: 'No update fields provided.', code: 'NO_UPDATES' });
        return;
      }

      values.push(id);
      const [result]: any = await pool.query(
        `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'User not found.', code: 'NOT_FOUND' });
        return;
      }

      res.status(200).json({ 
        message: 'User updated successfully.',
        deactivated: updates.isActive === false || updates.status === 'DEACTIVATED',
      });
    } catch (err: any) {
      console.error('[USER UPDATE ERROR]', err);
      res.status(500).json({ error: 'Failed to update user.', code: 'SERVER_ERROR' });
    }
  },

  // DELETE /api/users/:id
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Soft delete / permanent deactivation: revoke sessions immediately
      const [result]: any = await pool.query(
        "UPDATE users SET is_active = 0, status = 'DEACTIVATED', token_version = token_version + 1 WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'User not found.', code: 'NOT_FOUND' });
        return;
      }

      res.status(200).json({ message: 'User deactivated and removed from active roster.' });
    } catch (err: any) {
      console.error('[USER DELETE ERROR]', err);
      res.status(500).json({ error: 'Failed to delete user.', code: 'SERVER_ERROR' });
    }
  },
};
