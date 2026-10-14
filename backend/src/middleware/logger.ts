import type { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.ts';
import crypto from 'node:crypto';

/**
 * Inserts an immutable entry into the audit_logs table.
 */
export function recordAuditLog(params: {
  userId: string;
  userName: string;
  userRole: string;
  baseId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    const id = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, base_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      params.userId,
      params.userName,
      params.userRole,
      params.baseId || null,
      params.action,
      params.entityType,
      params.entityId,
      JSON.stringify(params.details),
      params.ipAddress || '127.0.0.1'
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR] Failed to record audit log:', err);
  }
}

/**
 * Express middleware that logs modifying HTTP requests (POST, PUT, DELETE, PATCH)
 * for military accountability and audit compliance.
 */
export function apiTransactionLogger(req: Request, res: Response, next: NextFunction) {
  // Capture start time
  const start = Date.now();

  // Hook into response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const statusCode = res.statusCode;

    // Log mutating requests or requests with errors
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) || statusCode >= 400) {
      const user = req.user;
      console.log(
        `[AUDIT] ${method} ${req.originalUrl} | Status: ${statusCode} | Time: ${duration}ms | User: ${
          user ? `${user.name} (${user.role})` : 'Anonymous'
        }`
      );
    }
  });

  next();
}
