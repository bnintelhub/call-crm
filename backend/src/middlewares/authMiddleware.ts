import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  name: string;
}

// Extend express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

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

    // Verify user is still active in database
    const [rows]: any = await pool.query(
      'SELECT id, is_active, role, company_id FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!rows || rows.length === 0 || !rows[0].is_active) {
      res.status(401).json({ error: 'Invalid token or inactive user.' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: rows[0].role,
      companyId: rows[0].company_id,
      name: decoded.name,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
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
