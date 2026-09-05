import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  name: string;
  tokenVersion?: number;
}

// Extend express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Enhanced Authentication & Real-time Account Deactivation Guard
 * Validates JWT AND checks live DB status for:
 * 1. User active status (is_active === 1)
 * 2. Token version (session revocation upon password change / logout)
 * 3. Tenant Company status (suspended / cancelled)
 * 4. Tenant Activation Key status (deactivated)
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication token required.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'bnorbit_crm_super_secure_jwt_token_secret_key_2026';
    const decoded = jwt.verify(token, secret) as AuthUserPayload;

    // Real-time Database Check: User status + Linked Company status
    const [rows]: any = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.is_active, u.status AS user_status, 
        u.role, u.company_id, u.token_version,
        c.name AS company_name, c.status AS company_status, c.activation_key_status
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
      LIMIT 1`,
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      res.status(401).json({ error: 'Invalid token or user no longer exists.', code: 'INVALID_TOKEN' });
      return;
    }

    const userRow = rows[0];

    // 1. Account Deactivation Guard
    if (!userRow.is_active || userRow.user_status === 'DEACTIVATED' || userRow.user_status === 'SUSPENDED') {
      res.status(403).json({ 
        error: 'Your account has been deactivated. Please contact your supervisor or administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
      return;
    }

    // 2. Token Version / Session Revocation Check
    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== userRow.token_version) {
      res.status(401).json({ 
        error: 'Your session has been revoked. Please login again.',
        code: 'SESSION_REVOKED'
      });
      return;
    }

    // 3. Tenant Company Suspension Guard (for non-SuperAdmin users)
    if (userRow.company_id) {
      if (userRow.company_status === 'suspended' || userRow.company_status === 'cancelled') {
        res.status(403).json({ 
          error: `Company account (${userRow.company_name || 'Organization'}) is suspended. Access blocked.`,
          code: 'COMPANY_SUSPENDED'
        });
        return;
      }
      if (userRow.activation_key_status === 'deactivated') {
        res.status(403).json({ 
          error: `Company activation key is deactivated by Super Admin. Access blocked.`,
          code: 'ACTIVATION_KEY_DEACTIVATED'
        });
        return;
      }
    }

    // Attach validated user to Request
    req.user = {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      companyId: userRow.company_id,
      name: userRow.name,
      tokenVersion: userRow.token_version,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Session expired. Please login again.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Invalid token.', code: 'INVALID_TOKEN' });
    return;
  }
}

export function requireRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied: insufficient permissions.' });
      return;
    }
    next();
  };
}
