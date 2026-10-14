import { Router } from 'express';
import { db } from '../db/database.ts';
import { recordAuditLog } from '../middleware/logger.ts';
import { requireRole, requireBaseAccess } from '../middleware/auth.ts';

export const assignmentsRouter = Router();

// ==================== ASSIGNMENTS ====================

// GET /api/assignments - List personnel assignments
assignmentsRouter.get('/', (req, res) => {
  try {
    const user = req.user!;
    let { baseId, categoryId, status, search } = req.query as {
      baseId?: string;
      categoryId?: string;
      status?: string;
      search?: string;
    };

    if (user.role === 'commander' && user.base_id) {
      baseId = user.base_id;
    }

    let sql = `
      SELECT a.*, b.name as base_name, b.code as base_code, c.name as category_name, c.unit_of_measure, u.name as issued_by_name
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_categories c ON a.category_id = c.id
      JOIN users u ON a.issued_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (baseId && baseId !== 'all') {
      sql += ` AND a.base_id = ?`;
      params.push(baseId);
    }
    if (categoryId && categoryId !== 'all') {
      sql += ` AND a.category_id = ?`;
      params.push(categoryId);
    }
    if (status && status !== 'all') {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (search && search.trim() !== '') {
      sql += ` AND (a.personnel_name LIKE ? OR a.military_id LIKE ? OR a.asset_name LIKE ? OR a.assignment_code LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY a.issue_date DESC, a.created_at DESC`;

    const assignments = db.prepare(sql).all(...params);
    res.json({ assignments });
  } catch (err: any) {
    console.error('[ASSIGNMENTS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch assignments', details: err.message });
  }
});

// POST /api/assignments - Assign asset to military personnel
assignmentsRouter.post(
  '/',
  // Base Commanders and Admins can assign weapons/equipment
  requireRole('admin', 'commander'),
  requireBaseAccess((req) => req.body.baseId),
  (req, res) => {
    try {
      const user = req.user!;
      const {
        baseId,
        categoryId,
        assetName,
        personnelName,
        militaryId,
        rank,
        unit,
        quantity,
        issueDate,
        returnDueDate,
        notes
      } = req.body;

      if (!baseId || !categoryId || !assetName || !personnelName || !militaryId || !quantity || !issueDate) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Base, Category, Asset Name, Personnel Name, Service ID, Quantity, and Issue Date are required.'
        });
      }

      const numQty = parseInt(quantity, 10);
      if (isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number.' });
      }

      // Check on-hand stock
      const item = db.prepare(`
        SELECT id, current_quantity FROM inventory_items
        WHERE base_id = ? AND category_id = ? AND asset_name = ?
      `).get(baseId, categoryId, assetName.trim()) as { id: string; current_quantity: number } | undefined;

      if (!item || item.current_quantity < numQty) {
        const available = item ? item.current_quantity : 0;
        return res.status(400).json({
          error: 'Insufficient inventory',
          message: `Cannot assign ${numQty} units. Only ${available} units available on-hand at this base.`
        });
      }

      const assignmentId = `asn-${Date.now()}`;
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const assignmentCode = `ASN-2026-${randomSeq}`;

      db.exec('BEGIN TRANSACTION;');

      try {
        // 1. Decrement available inventory
        db.prepare(`
          UPDATE inventory_items
          SET current_quantity = current_quantity - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(numQty, item.id);

        // 2. Record Assignment
        db.prepare(`
          INSERT INTO assignments (id, assignment_code, base_id, category_id, asset_name, personnel_name, military_id, rank, unit, quantity, issue_date, return_due_date, status, issued_by, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
        `).run(
          assignmentId,
          assignmentCode,
          baseId,
          categoryId,
          assetName.trim(),
          personnelName.trim(),
          militaryId.trim(),
          rank?.trim() || 'Soldier',
          unit?.trim() || 'Unit Command',
          numQty,
          issueDate,
          returnDueDate || null,
          user.id,
          notes?.trim() || null
        );

        db.exec('COMMIT;');

        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId,
          action: 'ASSIGN_ASSET',
          entityType: 'ASSIGNMENT',
          entityId: assignmentCode,
          details: {
            assignmentId,
            assignmentCode,
            personnelName,
            militaryId,
            assetName,
            quantity: numQty,
            unit
          },
          ipAddress: req.ip
        });

        res.status(201).json({
          message: 'Asset successfully assigned to military personnel.',
          assignment: {
            id: assignmentId,
            assignmentCode,
            personnelName,
            militaryId,
            quantity: numQty,
            status: 'ACTIVE'
          }
        });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[ASSIGNMENT POST ERROR]:', err);
      res.status(500).json({ error: 'Failed to create assignment', details: err.message });
    }
  }
);

// POST /api/assignments/:id/return - Return assigned asset back to base armory
assignmentsRouter.post(
  '/:id/return',
  requireRole('admin', 'commander'),
  (req, res) => {
    try {
      const user = req.user!;
      const assignmentId = req.params.id;

      const assignment = db.prepare(`SELECT * FROM assignments WHERE id = ?`).get(assignmentId) as any;
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      if (assignment.status === 'RETURNED') {
        return res.status(400).json({ error: 'Asset has already been returned.' });
      }

      if (user.role === 'commander' && user.base_id && user.base_id !== assignment.base_id) {
        return res.status(403).json({ error: 'Forbidden', message: 'You can only process returns for your base.' });
      }

      db.exec('BEGIN TRANSACTION;');

      try {
        // Return asset to inventory
        const item = db.prepare(`
          SELECT id FROM inventory_items
          WHERE base_id = ? AND category_id = ? AND asset_name = ?
        `).get(assignment.base_id, assignment.category_id, assignment.asset_name) as { id: string } | undefined;

        if (item) {
          db.prepare(`
            UPDATE inventory_items
            SET current_quantity = current_quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(assignment.quantity, item.id);
        }

        const returnDate = new Date().toISOString().split('T')[0];
        db.prepare(`
          UPDATE assignments
          SET status = 'RETURNED', return_date = ?
          WHERE id = ?
        `).run(returnDate, assignmentId);

        db.exec('COMMIT;');

        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId: assignment.base_id,
          action: 'RETURN_ASSET',
          entityType: 'ASSIGNMENT',
          entityId: assignment.assignment_code,
          details: {
            assignmentId,
            assignmentCode: assignment.assignment_code,
            personnel: assignment.personnel_name,
            asset: assignment.asset_name,
            quantity: assignment.quantity,
            returnDate
          },
          ipAddress: req.ip
        });

        res.json({ message: 'Asset successfully returned to armory inventory.' });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[ASSIGNMENT RETURN ERROR]:', err);
      res.status(500).json({ error: 'Failed to process asset return', details: err.message });
    }
  }
);

// ==================== EXPENDITURES ====================

// GET /api/assignments/expenditures - List asset expenditures
assignmentsRouter.get('/expenditures', (req, res) => {
  try {
    const user = req.user!;
    let { baseId, categoryId, type, startDate, endDate } = req.query as {
      baseId?: string;
      categoryId?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    };

    if (user.role === 'commander' && user.base_id) {
      baseId = user.base_id;
    }

    let sql = `
      SELECT e.*, b.name as base_name, b.code as base_code, c.name as category_name, c.unit_of_measure, u.name as authorized_by_name
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      JOIN equipment_categories c ON e.category_id = c.id
      JOIN users u ON e.authorized_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (baseId && baseId !== 'all') {
      sql += ` AND e.base_id = ?`;
      params.push(baseId);
    }
    if (categoryId && categoryId !== 'all') {
      sql += ` AND e.category_id = ?`;
      params.push(categoryId);
    }
    if (type && type !== 'all') {
      sql += ` AND e.expenditure_type = ?`;
      params.push(type);
    }
    if (startDate) {
      sql += ` AND e.expenditure_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND e.expenditure_date <= ?`;
      params.push(endDate);
    }

    sql += ` ORDER BY e.expenditure_date DESC, e.created_at DESC`;

    const expenditures = db.prepare(sql).all(...params);
    res.json({ expenditures });
  } catch (err: any) {
    console.error('[EXPENDITURES GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch expenditures', details: err.message });
  }
});

// POST /api/assignments/expenditures - Record asset expenditure (live-fire, combat, decommission)
assignmentsRouter.post(
  '/expenditures',
  requireRole('admin', 'commander'),
  requireBaseAccess((req) => req.body.baseId),
  (req, res) => {
    try {
      const user = req.user!;
      const {
        baseId,
        categoryId,
        assetName,
        quantity,
        expenditureType,
        expenditureDate,
        missionRef,
        afterActionReport
      } = req.body;

      if (!baseId || !categoryId || !assetName || !quantity || !expenditureType || !expenditureDate || !missionRef) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Base, Category, Asset Name, Quantity, Expenditure Type, Date, and Mission Reference are required.'
        });
      }

      const numQty = parseInt(quantity, 10);
      if (isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer.' });
      }

      // Check on-hand stock
      const item = db.prepare(`
        SELECT id, current_quantity FROM inventory_items
        WHERE base_id = ? AND category_id = ? AND asset_name = ?
      `).get(baseId, categoryId, assetName.trim()) as { id: string; current_quantity: number } | undefined;

      if (!item || item.current_quantity < numQty) {
        const available = item ? item.current_quantity : 0;
        return res.status(400).json({
          error: 'Insufficient inventory',
          message: `Cannot record expenditure of ${numQty} units. Only ${available} available on-hand at base.`
        });
      }

      const expenditureId = `exp-${Date.now()}`;
      const randomSeq = Math.floor(10 + Math.random() * 90);
      const expenditureCode = `EXP-2026-${randomSeq}`;

      db.exec('BEGIN TRANSACTION;');

      try {
        // 1. Decrement inventory
        db.prepare(`
          UPDATE inventory_items
          SET current_quantity = current_quantity - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(numQty, item.id);

        // 2. Insert expenditure record
        db.prepare(`
          INSERT INTO expenditures (id, expenditure_code, base_id, category_id, asset_name, quantity, expenditure_type, expenditure_date, mission_ref, authorized_by, after_action_report)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          expenditureId,
          expenditureCode,
          baseId,
          categoryId,
          assetName.trim(),
          numQty,
          expenditureType,
          expenditureDate,
          missionRef.trim(),
          user.id,
          afterActionReport?.trim() || null
        );

        db.exec('COMMIT;');

        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId,
          action: 'RECORD_EXPENDITURE',
          entityType: 'EXPENDITURE',
          entityId: expenditureCode,
          details: {
            expenditureId,
            expenditureCode,
            assetName,
            quantity: numQty,
            expenditureType,
            missionRef
          },
          ipAddress: req.ip
        });

        res.status(201).json({
          message: 'Asset expenditure logged and deducted from active base balance.',
          expenditure: {
            id: expenditureId,
            expenditureCode,
            assetName,
            quantity: numQty,
            expenditureType,
            expenditureDate
          }
        });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[EXPENDITURE POST ERROR]:', err);
      res.status(500).json({ error: 'Failed to record expenditure', details: err.message });
    }
  }
);
