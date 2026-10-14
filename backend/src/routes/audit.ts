import { Router } from 'express';
import { db } from '../db/database.ts';
import { requireRole } from '../middleware/auth.ts';

export const auditRouter = Router();

// GET /api/audit - Fetch immutable audit logs for military compliance
auditRouter.get(
  '/',
  requireRole('admin', 'commander'),
  (req, res) => {
    try {
      const user = req.user!;
      let { baseId, action, entityType, limit = '100' } = req.query as {
        baseId?: string;
        action?: string;
        entityType?: string;
        limit?: string;
      };

      if (user.role === 'commander' && user.base_id) {
        baseId = user.base_id;
      }

      let sql = `
        SELECT a.*, b.name as base_name, b.code as base_code
        FROM audit_logs a
        LEFT JOIN bases b ON a.base_id = b.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (baseId && baseId !== 'all') {
        sql += ` AND (a.base_id = ? OR a.base_id IS NULL)`;
        params.push(baseId);
      }
      if (action && action !== 'all') {
        sql += ` AND a.action = ?`;
        params.push(action);
      }
      if (entityType && entityType !== 'all') {
        sql += ` AND a.entity_type = ?`;
        params.push(entityType);
      }

      sql += ` ORDER BY a.timestamp DESC LIMIT ?`;
      params.push(parseInt(limit, 10) || 100);

      const logs = db.prepare(sql).all(...params);
      res.json({ logs });
    } catch (err: any) {
      console.error('[AUDIT GET ERROR]:', err);
      res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
    }
  }
);
