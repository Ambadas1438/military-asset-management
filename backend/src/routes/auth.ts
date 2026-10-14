import { Router } from 'express';
import { db } from '../db/database.ts';
import { recordAuditLog } from '../middleware/logger.ts';

export const authRouter = Router();

// GET /api/auth/me - Get current user profile and role capabilities
authRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Get base info if assigned
  let base = null;
  if (req.user.base_id) {
    base = db.prepare('SELECT id, code, name, location, security_level FROM bases WHERE id = ?').get(req.user.base_id);
  }

  res.json({
    user: req.user,
    assignedBase: base,
    capabilities: {
      canViewAllBases: req.user.role === 'admin',
      canManageBase: req.user.role === 'admin' || req.user.role === 'commander',
      canRecordPurchases: true,
      canInitiateTransfers: true,
      canAssignPersonnel: req.user.role === 'admin' || req.user.role === 'commander',
      canRecordExpenditure: req.user.role === 'admin' || req.user.role === 'commander',
      canViewAuditLogs: req.user.role === 'admin',
    }
  });
});

// GET /api/auth/users - List mock military personas for instant role-switching & testability
authRouter.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.username, u.name, u.email, u.role, u.base_id, u.rank, u.service_number, b.name as base_name, b.code as base_code
    FROM users u
    LEFT JOIN bases b ON u.base_id = b.id
    ORDER BY 
      CASE u.role 
        WHEN 'admin' THEN 1 
        WHEN 'commander' THEN 2 
        WHEN 'logistics' THEN 3 
        ELSE 4 
      END
  `).all();

  res.json({ users });
});

// POST /api/auth/login - Credential-based authentication
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email or service identifier is required' });
  }

  const user = db.prepare(`
    SELECT u.*, b.name as base_name, b.code as base_code
    FROM users u
    LEFT JOIN bases b ON u.base_id = b.id
    WHERE LOWER(u.email) = LOWER(?) OR LOWER(u.username) = LOWER(?)
  `).get(email.trim(), email.trim()) as any;

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Personnel record not found. Please select a valid profile from the quick-login presets.'
    });
  }

  const token = `mil-jwt-${user.id}-${Date.now()}`;

  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    baseId: user.base_id,
    action: 'USER_LOGIN',
    entityType: 'AUTH',
    entityId: user.id,
    details: { email: user.email, role: user.role },
    ipAddress: req.ip
  });

  res.json({
    message: 'Authentication successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      base_id: user.base_id,
      base_name: user.base_name,
      base_code: user.base_code,
      rank: user.rank,
      service_number: user.service_number
    }
  });
});
