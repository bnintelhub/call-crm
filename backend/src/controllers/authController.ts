import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const authController = {
  // POST /api/auth/login
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMsg = validation.error.issues?.[0]?.message || 'Validation error';
        res.status(400).json({ error: errorMsg });
        return;
      }

      const { email, password } = validation.data;
      const normalizedEmail = email.trim().toLowerCase();

      // Query user and joined company
      const [rows]: any = await pool.query(
        `SELECT 
          u.id, u.employee_id, u.name, u.email, u.password_hash, u.role, 
          u.company_id, u.is_active, u.status AS user_status, u.profile_pic,
          c.name AS company_name, c.status AS company_status, c.activation_key_status
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE LOWER(u.email) = ?
        LIMIT 1`,
        [normalizedEmail]
      );

      if (!rows || rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const userRow = rows[0];

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      // Check user account active status
      if (!userRow.is_active) {
        res.status(403).json({ error: 'Your account has been deactivated. Please contact your administrator.' });
        return;
      }

      // Check tenant company status if user is linked to a company
      if (userRow.company_id) {
        if (userRow.company_status === 'suspended') {
          res.status(403).json({ error: `Company account (${userRow.company_name || 'Organization'}) is suspended.` });
          return;
        }
        if (userRow.activation_key_status === 'deactivated') {
          res.status(403).json({ error: `Company account (${userRow.company_name || 'Organization'}) is stopped. Its activation key has been deactivated.` });
          return;
        }
      }

      // Sign JWT Token
      const secret = process.env.JWT_SECRET || 'bnorbit_crm_super_secure_jwt_token_secret_key_2026';
      const token = jwt.sign(
        {
          id: userRow.id,
          email: userRow.email,
          role: userRow.role,
          companyId: userRow.company_id,
          name: userRow.name,
        },
        secret,
        { expiresIn: '7d' }
      );

      const userPayload = {
        id: userRow.id,
        employeeId: userRow.employee_id,
        name: userRow.name,
        email: userRow.email,
        role: userRow.role,
        companyId: userRow.company_id,
        companyName: userRow.company_name,
        isActive: Boolean(userRow.is_active),
        profilePic: userRow.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(userRow.name)}&background=random`,
      };

      res.status(200).json({
        token,
        user: userPayload,
      });
    } catch (err: any) {
      console.error('[AUTH LOGIN ERROR]', err);
      res.status(500).json({ error: 'Server error during authentication.' });
    }
  },

  // GET /api/auth/me
  me: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const [rows]: any = await pool.query(
        `SELECT 
          u.id, u.employee_id, u.name, u.email, u.role, 
          u.company_id, u.is_active, u.profile_pic,
          c.name AS company_name
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE u.id = ?
        LIMIT 1`,
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      const row = rows[0];
      res.status(200).json({
        user: {
          id: row.id,
          employeeId: row.employee_id,
          name: row.name,
          email: row.email,
          role: row.role,
          companyId: row.company_id,
          companyName: row.company_name,
          isActive: Boolean(row.is_active),
          profilePic: row.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`,
        },
      });
    } catch (err: any) {
      console.error('[AUTH ME ERROR]', err);
      res.status(500).json({ error: 'Failed to fetch user profile.' });
    }
  },

  // POST /api/auth/change-password
  changePassword: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.' });
        return;
      }

      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMsg = validation.error.issues?.[0]?.message || 'Validation error';
        res.status(400).json({ error: errorMsg });
        return;
      }

      const { currentPassword, newPassword } = validation.data;

      const [rows]: any = await pool.query(
        'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (err: any) {
      console.error('[AUTH CHANGE PASSWORD ERROR]', err);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  },
};
