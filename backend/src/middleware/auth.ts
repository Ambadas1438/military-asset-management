import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.ts';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'commander' | 'logistics';
  base_id: string | null;
  rank: string;
  service_number: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Extracts and sets the active authenticated user.
 * Supports:
 * - 'x-user-id' header (for dynamic user role switching during evaluation & operations)
 * - Defaults to 'user-admin' if not provided for frictionless dev / demo
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const userId = (req.headers['x-user-id'] as string) || 'user-admin';

  const user = db.prepare(`
    SELECT id, username, name, email, role, base_id, rank, service_number
    FROM users
    WHERE id = ?
  `).get(userId) as AuthUser | undefined;

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: `Invalid military credential or user identity for ID: ${userId}`
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Enforces that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles: Array<'admin' | 'commander' | 'logistics'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No authentication credentials provided.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${req.user.role}' lacks sufficient security clearance for this operation. Permitted roles: ${allowedRoles.join(', ')}`,
        currentRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

/**
 * Middleware: Validates that if the user is a Base Commander,
 * they can only view or mutate assets for their assigned military base.
 * Admins have unrestricted jurisdiction across all bases.
 */
export function requireBaseAccess(getBaseIdFromReq: (req: Request) => string | undefined | null) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Admins have supreme authority over all bases
    if (req.user.role === 'admin') {
      return next();
    }

    const targetBaseId = getBaseIdFromReq(req);

    // If Commander, ensure baseId matches
    if (req.user.role === 'commander') {
      if (targetBaseId && req.user.base_id !== targetBaseId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Commander '${req.user.name}' is only authorized for base '${req.user.base_id}'. Access to base '${targetBaseId}' is restricted.`,
          userBaseId: req.user.base_id,
          requestedBaseId: targetBaseId
        });
      }
    }

    next();
  };
}
