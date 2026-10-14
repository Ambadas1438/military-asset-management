import { Router } from 'express';
import { db } from '../db/database.ts';
import { recordAuditLog } from '../middleware/logger.ts';
import { requireRole } from '../middleware/auth.ts';

export const transfersRouter = Router();

// GET /api/transfers - View transfer history with filters
transfersRouter.get('/', (req, res) => {
  try {
    const user = req.user!;
    let { baseId, categoryId, status, startDate, endDate, search } = req.query as {
      baseId?: string;
      categoryId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    };

    // RBAC: Commander can only see transfers involving their assigned base
    if (user.role === 'commander' && user.base_id) {
      baseId = user.base_id;
    }

    let sql = `
      SELECT t.*, 
             b1.name as origin_base_name, b1.code as origin_base_code,
             b2.name as destination_base_name, b2.code as destination_base_code,
             c.name as category_name, c.unit_of_measure,
             u1.name as initiated_by_name, u1.rank as initiated_by_rank,
             u2.name as received_by_name
      FROM transfers t
      JOIN bases b1 ON t.origin_base_id = b1.id
      JOIN bases b2 ON t.destination_base_id = b2.id
      JOIN equipment_categories c ON t.category_id = c.id
      JOIN users u1 ON t.initiated_by = u1.id
      LEFT JOIN users u2 ON t.received_by = u2.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (baseId && baseId !== 'all') {
      sql += ` AND (t.origin_base_id = ? OR t.destination_base_id = ?)`;
      params.push(baseId, baseId);
    }
    if (categoryId && categoryId !== 'all') {
      sql += ` AND t.category_id = ?`;
      params.push(categoryId);
    }
    if (status && status !== 'all') {
      sql += ` AND t.status = ?`;
      params.push(status);
    }
    if (startDate) {
      sql += ` AND t.transfer_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND t.transfer_date <= ?`;
      params.push(endDate);
    }
    if (search && search.trim() !== '') {
      sql += ` AND (t.asset_name LIKE ? OR t.tracking_number LIKE ? OR t.notes LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY t.transfer_date DESC, t.created_at DESC`;

    const transfers = db.prepare(sql).all(...params);
    res.json({ transfers });
  } catch (err: any) {
    console.error('[TRANSFERS GET ERROR]:', err);
    res.status(500).json({ error: 'Failed to fetch transfers', details: err.message });
  }
});

// POST /api/transfers - Initiate an asset transfer between military bases
transfersRouter.post(
  '/',
  requireRole('admin', 'commander', 'logistics'),
  (req, res) => {
    try {
      const user = req.user!;
      const {
        originBaseId,
        destinationBaseId,
        categoryId,
        assetName,
        quantity,
        transportMode,
        transferDate,
        status = 'COMPLETED',
        notes
      } = req.body;

      // Base checks for Commander
      if (user.role === 'commander' && user.base_id) {
        if (originBaseId !== user.base_id && destinationBaseId !== user.base_id) {
          return res.status(403).json({
            error: 'Forbidden',
            message: `Base Commander ${user.name} can only authorize transfers involving their command base (${user.base_id}).`
          });
        }
      }

      if (!originBaseId || !destinationBaseId || !categoryId || !assetName || !quantity || !transferDate) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Origin base, destination base, category, asset name, quantity, and transfer date are required.'
        });
      }

      if (originBaseId === destinationBaseId) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Origin base and Destination base cannot be the same.'
        });
      }

      const numQty = parseInt(quantity, 10);
      if (isNaN(numQty) || numQty <= 0) {
        return res.status(400).json({ error: 'Validation failed', message: 'Quantity must be a positive integer.' });
      }

      // Check current available stock at origin base
      const originItem = db.prepare(`
        SELECT id, current_quantity, asset_name FROM inventory_items
        WHERE base_id = ? AND category_id = ? AND asset_name = ?
      `).get(originBaseId, categoryId, assetName.trim()) as { id: string; current_quantity: number; asset_name: string } | undefined;

      if (!originItem || originItem.current_quantity < numQty) {
        const available = originItem ? originItem.current_quantity : 0;
        return res.status(400).json({
          error: 'Insufficient inventory',
          message: `Cannot transfer ${numQty} units of '${assetName}'. Origin base currently holds only ${available} available units.`
        });
      }

      const transferId = `trf-${Date.now()}`;
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = `TRF-2026-${randomSeq}`;

      db.exec('BEGIN TRANSACTION;');

      try {
        // 1. Decrement inventory at origin base
        db.prepare(`
          UPDATE inventory_items
          SET current_quantity = current_quantity - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(numQty, originItem.id);

        // 2. If status is COMPLETED, increment at destination base immediately
        if (status === 'COMPLETED') {
          const destItem = db.prepare(`
            SELECT id, current_quantity FROM inventory_items
            WHERE base_id = ? AND category_id = ? AND asset_name = ?
          `).get(destinationBaseId, categoryId, assetName.trim()) as { id: string; current_quantity: number } | undefined;

          if (destItem) {
            db.prepare(`
              UPDATE inventory_items
              SET current_quantity = current_quantity + ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(numQty, destItem.id);
          } else {
            const newInvId = `inv-${Date.now()}-dest`;
            db.prepare(`
              INSERT INTO inventory_items (id, base_id, category_id, asset_name, model_number, initial_balance, current_quantity, minimum_threshold)
              VALUES (?, ?, ?, ?, ?, 0, ?, 10)
            `).run(newInvId, destinationBaseId, categoryId, assetName.trim(), 'Standard Military Spec', numQty);
          }
        }

        // 3. Record transfer manifest
        db.prepare(`
          INSERT INTO transfers (id, tracking_number, origin_base_id, destination_base_id, category_id, asset_name, quantity, status, transport_mode, transfer_date, initiated_by, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          transferId,
          trackingNumber,
          originBaseId,
          destinationBaseId,
          categoryId,
          assetName.trim(),
          numQty,
          status,
          transportMode || 'Tactical Military Freight',
          transferDate,
          user.id,
          notes?.trim() || null
        );

        db.exec('COMMIT;');

        // 4. Log Audit Trail
        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId: originBaseId,
          action: 'INITIATE_TRANSFER',
          entityType: 'TRANSFER',
          entityId: trackingNumber,
          details: {
            transferId,
            trackingNumber,
            originBaseId,
            destinationBaseId,
            assetName,
            quantity: numQty,
            status,
            transferDate
          },
          ipAddress: req.ip
        });

        res.status(201).json({
          message: 'Asset transfer manifest created successfully.',
          transfer: {
            id: transferId,
            trackingNumber,
            originBaseId,
            destinationBaseId,
            assetName,
            quantity: numQty,
            status,
            transferDate
          }
        });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[TRANSFER POST ERROR]:', err);
      res.status(500).json({ error: 'Failed to initiate transfer', details: err.message });
    }
  }
);

// PATCH /api/transfers/:id/receive - Mark an IN_TRANSIT transfer as COMPLETED upon arrival
transfersRouter.patch(
  '/:id/receive',
  requireRole('admin', 'commander', 'logistics'),
  (req, res) => {
    try {
      const user = req.user!;
      const transferId = req.params.id;

      const transfer = db.prepare(`SELECT * FROM transfers WHERE id = ?`).get(transferId) as any;
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      if (transfer.status === 'COMPLETED') {
        return res.status(400).json({ error: 'Transfer is already marked completed.' });
      }

      // Check destination base permissions
      if (user.role === 'commander' && user.base_id && user.base_id !== transfer.destination_base_id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only the destination Base Commander or an Administrator can confirm arrival of goods.'
        });
      }

      db.exec('BEGIN TRANSACTION;');

      try {
        // Increment inventory at destination base
        const destItem = db.prepare(`
          SELECT id, current_quantity FROM inventory_items
          WHERE base_id = ? AND category_id = ? AND asset_name = ?
        `).get(transfer.destination_base_id, transfer.category_id, transfer.asset_name) as { id: string } | undefined;

        if (destItem) {
          db.prepare(`
            UPDATE inventory_items
            SET current_quantity = current_quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(transfer.quantity, destItem.id);
        } else {
          const newInvId = `inv-${Date.now()}-recv`;
          db.prepare(`
            INSERT INTO inventory_items (id, base_id, category_id, asset_name, model_number, initial_balance, current_quantity, minimum_threshold)
            VALUES (?, ?, ?, ?, ?, 0, ?, 10)
          `).run(newInvId, transfer.destination_base_id, transfer.category_id, transfer.asset_name, 'Standard Military Spec', transfer.quantity);
        }

        // Update transfer status
        db.prepare(`
          UPDATE transfers
          SET status = 'COMPLETED', received_by = ?
          WHERE id = ?
        `).run(user.id, transferId);

        db.exec('COMMIT;');

        recordAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          baseId: transfer.destination_base_id,
          action: 'RECEIVE_TRANSFER',
          entityType: 'TRANSFER',
          entityId: transfer.tracking_number,
          details: {
            transferId,
            trackingNumber: transfer.tracking_number,
            receivedBy: user.name,
            quantity: transfer.quantity,
            asset: transfer.asset_name
          },
          ipAddress: req.ip
        });

        res.json({ message: 'Transfer received and destination inventory updated successfully.' });
      } catch (innerErr) {
        db.exec('ROLLBACK;');
        throw innerErr;
      }
    } catch (err: any) {
      console.error('[TRANSFER RECEIVE ERROR]:', err);
      res.status(500).json({ error: 'Failed to complete transfer arrival', details: err.message });
    }
  }
);
