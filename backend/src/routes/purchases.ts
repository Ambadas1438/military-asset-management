import { Router } from 'express';
import { db } from '../db/database.ts';
import { recordAuditLog } from '../middleware/logger.ts';
import { requireRole, requireBaseAccess } from '../middleware/auth.ts';
import crypto from 'node:crypto';

export const purchasesRouter = Router();

// GET /api/purchases - List historical purchases with filters
purchasesRouter.get('/', (req, res) => {
  try {
    const user = req.user!;
    let { baseId, categoryId, startDate, endDate, search } = req.query as {
      baseId?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    };

    // RBAC: Commander can only see purchases for their own base
    if (user.role === 'commander' && user.base_id) {
      baseId = user.base_id;
    }

    let sql = `
      SELECT p.*, b.name as base_name, b.code as base_code, c.name as category_name, c.unit_of_measure, u.name as created_by_name, u.rank as created_by_rank
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_categories c ON p.category_id = c.id
      JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (baseId && baseId !== 'all') {
      sql += ` AND p.base_id = ?`;
      params.push(baseId);
    }
    if (categoryId && categoryId !== 'all') {
      sql += ` AND p.category_id = ?`;
      params.push(categoryId);
    }
    if (startDate) {
      sql += ` AND p.purchase_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND p.purchase_date <= ?`;
      params.push(endDate);
    }
    if (search && search.trim() !== '') {
      sql += ` AND (p.asset_name LIKE ? OR p.purchase_order LIKE ? OR p.supplier LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY p.purchase_date DESC, p.created_at DESC`;

    const purchases = db.prepare(sql).all(...params);
    res.json({ purchases });
  } catch (err: any) {
    console.error('[PURCHASES GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch purchases', details: err.message });
  }
});

// POST /api/purchases - Record a new asset purchase for a specific base
purchasesRouter.post(
  '/',
  // All three roles (admin, commander, logistics) can record purchases subject to base check
  requireRole('admin', 'commander', 'logistics'),
  requireBaseAccess((req) => req.body.baseId),
  (req, res) => {
    try {
      const user = req.user!;
      const {
        baseId,
        categoryId,
        assetName,
        serialOrBatch,
        quantity,
        unitCost,
        supplier,
        purchaseDate,
        notes,
      } = req.body;

      // Validation
      if (!baseId || !categoryId || !assetName || !quantity || !unitCost || !supplier || !purchaseDate) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Base, Category, Asset Name, Quantity (>0), Unit Cost, Supplier, and Purchase Date are required.'
        });
      }

      const numQty = parseInt(quantity, 10);
      const numUnitCost = parseFloat(unitCost);

      if (isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({ error: 'Validation failed', message: 'Quantity must be a positive integer.' });
      }
      if (isNaN(numUnitCost) || numUnitCost < 0) {
        return res.status(400).json({ error: 'Validation failed', message: 'Unit cost must be a valid positive number.' });
      }

      const totalCost = Math.round(numQty * numUnitCost * 100) / 100;
      const purchaseId = `pur-${Date.now()}`;
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const purchaseOrder = `PO-2026-${randomSeq}`;

      // Execute transactionally
      db.exec('BEGIN TRANSACTION;');

      try {
        // 1. Insert Purchase Record
        const insertStmt = db.prepare(`
          INSERT INTO purchases (id, purchase_order, base_id, category_id, asset_name, serial_or_batch, quantity, unit_cost, total_cost, supplier, purchase_date, created_by, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertStmt.run(
          purchaseId,
          purchaseOrder,
          baseId,
          categoryId,
          assetName.trim(),
          serialOrBatch?.trim() || `BATCH-${randomSeq}`,
          numQty,
          numUnitCost,
          totalCost,
          supplier.trim(),
          purchaseDate,
          user.id,
          notes?.trim() || null
        );

        // 2. Upsert Inventory Item at the base
        const existingItem = db.prepare(`
          SELECT id, current_quantity FROM inventory_items
          WHERE base_id = ? AND category_id = ? AND asset_name = ?
        `).get(baseId, categoryId, assetName.trim()) as { id: string; current_quantity: number } | undefined;

        if (existingItem) {
          db.prepare(`
            UPDATE inventory_items
            SET current_quantity = current_quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(numQty, existingItem.id);
        } else {
          const invId = `inv-${Date.now()}`;
          db.prepare(`
            INSERT INTO inventory_items (id, base_id, category_id, asset_name, model_number, initial_balance, current_quantity, minimum_threshold)
            VALUES (?, ?, ?, ?, ?, 0, ?, 10)
          `).run(invId, baseId, categoryId, assetName.trim(), 'Standard Military Spec', numQty);
        }

        db.exec('COMMIT;');

        // 3. Log Audit Trail
        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId,
          action: 'RECORD_PURCHASE',
          entityType: 'PURCHASE',
          entityId: purchaseOrder,
          details: {
            purchaseId,
            purchaseOrder,
            baseId,
            categoryId,
            assetName,
            quantity: numQty,
            unitCost: numUnitCost,
            totalCost,
            supplier,
            purchaseDate
          },
          ipAddress: req.ip
        });

        res.status(201).json({
          message: 'Asset purchase recorded and inventory updated successfully.',
          purchase: {
            id: purchaseId,
            purchaseOrder,
            baseId,
            categoryId,
            assetName,
            quantity: numQty,
            totalCost,
            purchaseDate
          }
        });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[PURCHASE POST ERROR]:', err);
      res.status(500).json({ error: 'Failed to record purchase', details: err.message });
    }
  }
);
