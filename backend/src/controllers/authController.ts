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
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const authController = {
  // POST /api/auth/login
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMsg = validation.error.issues?.[0]?.message || 'Validation error';
        res.status(400).json({ error: errorMsg, code: 'VALIDATION_ERROR' });
        return;
      }

      const { email, password } = validation.data;
      const normalizedEmail = email.trim().toLowerCase();

      // Query user and linked tenant company
      const [rows]: any = await pool.query(
        `SELECT 
          u.id, u.employee_id, u.name, u.email, u.password_hash, u.role, 
          u.company_id, u.is_active, u.status AS user_status, u.token_version,
          u.failed_login_attempts, u.locked_until, u.profile_pic,
          c.name AS company_name, c.status AS company_status, c.activation_key_status
        FROM users u
        LEFT JOIN companies c ON u.company_id = c.id
        WHERE LOWER(u.email) = ?
        LIMIT 1`,
        [normalizedEmail]
      );

      if (!rows || rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
        return;
      }

      const userRow = rows[0];

      // 1. Account Lockout Check (Brute-force protection)
      if (userRow.locked_until && new Date(userRow.locked_until) > new Date()) {
        const remainingMinutes = Math.ceil((new Date(userRow.locked_until).getTime() - Date.now()) / (60 * 1000));
        res.status(423).json({
          error: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMinutes} minute(s) or contact administrator.`,
          code: 'ACCOUNT_LOCKED',
          retryAfterMinutes: remainingMinutes,
        });
        return;
      }

      // 2. Account Deactivation Guard (Real-time user status)
      if (!userRow.is_active || userRow.user_status === 'DEACTIVATED' || userRow.user_status === 'SUSPENDED') {
        res.status(403).json({
          error: 'Your account has been deactivated. Please contact your supervisor or administrator.',
          code: 'ACCOUNT_DEACTIVATED',
        });
        return;
      }

      // 3. Tenant Company Suspension Guard
      if (userRow.company_id) {
        if (userRow.company_status === 'suspended' || userRow.company_status === 'cancelled') {
          res.status(403).json({
            error: `Company account (${userRow.company_name || 'Organization'}) is suspended. Access blocked.`,
            code: 'COMPANY_SUSPENDED',
          });
          return;
        }
        if (userRow.activation_key_status === 'deactivated') {
          res.status(403).json({
            error: `Company activation key is deactivated by Super Admin. Access blocked.`,
            code: 'ACTIVATION_KEY_DEACTIVATED',
          });
          return;
        }
      }

      // 4. Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);
      if (!isPasswordValid) {
        const attempts = (userRow.failed_login_attempts || 0) + 1;
        if (attempts >= 5) {
          // Lock account for 15 minutes
          const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          await pool.query(
            'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
            [attempts, lockedUntil, userRow.id]
          );
          res.status(423).json({
            error: 'Account locked due to 5 consecutive failed login attempts. Please try again after 15 minutes or contact your administrator.',
            code: 'ACCOUNT_LOCKED',
            retryAfterMinutes: 15,
          });
          return;
        } else {
          await pool.query(
            'UPDATE users SET failed_login_attempts = ? WHERE id = ?',
            [attempts, userRow.id]
          );
          const remaining = 5 - attempts;
          res.status(401).json({
            error: `Invalid email or password. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout)`,
            code: 'INVALID_CREDENTIALS',
            remainingAttempts: remaining,
          });
          return;
        }
      }

      // 5. Successful Login: Reset failed attempts, update audit trail (last_login_at, last_login_ip)
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
      await pool.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
        [clientIp, userRow.id]
      );

      // 6. Sign JWT Token with tokenVersion for session revocation support
      const secret = process.env.JWT_SECRET || 'bnorbit_crm_super_secure_jwt_token_secret_key_2026';
      const token = jwt.sign(
        {
          id: userRow.id,
          email: userRow.email,
          role: userRow.role,
          companyId: userRow.company_id,
          name: userRow.name,
          tokenVersion: userRow.token_version ?? 0,
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
      res.status(500).json({ error: 'Server error during authentication.', code: 'SERVER_ERROR' });
    }
  },

  // GET /api/auth/me
  me: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.', code: 'UNAUTHORIZED' });
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
        res.status(404).json({ error: 'User not found.', code: 'NOT_FOUND' });
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
      res.status(500).json({ error: 'Failed to fetch user profile.', code: 'SERVER_ERROR' });
    }
  },

  // POST /api/auth/change-password
  changePassword: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized.', code: 'UNAUTHORIZED' });
        return;
      }

      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        const errorMsg = validation.error.issues?.[0]?.message || 'Validation error';
        res.status(400).json({ error: errorMsg, code: 'VALIDATION_ERROR' });
        return;
      }

      const { currentPassword, newPassword } = validation.data;

      const [rows]: any = await pool.query(
        'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        res.status(404).json({ error: 'User not found.', code: 'NOT_FOUND' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect.', code: 'INCORRECT_PASSWORD' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      // Increment token_version to invalidate all existing JWT tokens on other devices
      await pool.query(
        'UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?',
        [newHash, req.user.id]
      );

      res.status(200).json({ 
        message: 'Password updated successfully. Other sessions have been terminated.',
        code: 'PASSWORD_UPDATED' 
      });
    } catch (err: any) {
      console.error('[AUTH CHANGE PASSWORD ERROR]', err);
      res.status(500).json({ error: 'Failed to update password.', code: 'SERVER_ERROR' });
    }
  },
};
