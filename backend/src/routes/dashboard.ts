import { Router } from 'express';
import { db } from '../db/database.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/metrics
dashboardRouter.get('/metrics', (req, res) => {
  try {
    const user = req.user!;
    let { startDate, endDate, baseId, categoryId } = req.query as {
      startDate?: string;
      endDate?: string;
      baseId?: string;
      categoryId?: string;
    };

    // RBAC: If Base Commander, enforce their base
    if (user.role === 'commander' && user.base_id) {
      baseId = user.base_id;
    }

    // Default dates if omitted: full history from 2026-09-01 to today
    const start = startDate ? startDate : '2026-09-01';
    const end = endDate ? endDate : '2026-10-31';

    const isAllBases = !baseId || baseId === 'all';
    const isAllCategories = !categoryId || categoryId === 'all';

    // 1. Calculate Baseline Opening Balance before `start`
    // Opening = Initial Balances + Purchases (< start) + Transfers In (< start) - Transfers Out (< start) - Expenditures (< start)
    
    // Initial balances
    let initialBalQuery = `SELECT COALESCE(SUM(initial_balance), 0) as total FROM inventory_items WHERE 1=1`;
    const initialBalParams: any[] = [];
    if (!isAllBases) {
      initialBalQuery += ` AND base_id = ?`;
      initialBalParams.push(baseId);
    }
    if (!isAllCategories) {
      initialBalQuery += ` AND category_id = ?`;
      initialBalParams.push(categoryId);
    }
    const initialSum = (db.prepare(initialBalQuery).get(...initialBalParams) as any)?.total || 0;

    // Prior Purchases (< start)
    let priorPurchasesQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases WHERE purchase_date < ?`;
    const priorPurchasesParams: any[] = [start];
    if (!isAllBases) {
      priorPurchasesQuery += ` AND base_id = ?`;
      priorPurchasesParams.push(baseId);
    }
    if (!isAllCategories) {
      priorPurchasesQuery += ` AND category_id = ?`;
      priorPurchasesParams.push(categoryId);
    }
    const priorPurchases = (db.prepare(priorPurchasesQuery).get(...priorPurchasesParams) as any)?.total || 0;

    // Prior Transfers In (< start)
    let priorTrfInQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE transfer_date < ? AND status = 'COMPLETED'`;
    const priorTrfInParams: any[] = [start];
    if (!isAllBases) {
      priorTrfInQuery += ` AND destination_base_id = ?`;
      priorTrfInParams.push(baseId);
    }
    if (!isAllCategories) {
      priorTrfInQuery += ` AND category_id = ?`;
      priorTrfInParams.push(categoryId);
    }
    // If all bases, inter-base transfers cancel each other out in aggregate!
    const priorTrfIn = isAllBases ? 0 : ((db.prepare(priorTrfInQuery).get(...priorTrfInParams) as any)?.total || 0);

    // Prior Transfers Out (< start)
    let priorTrfOutQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers WHERE transfer_date < ? AND status = 'COMPLETED'`;
    const priorTrfOutParams: any[] = [start];
    if (!isAllBases) {
      priorTrfOutQuery += ` AND origin_base_id = ?`;
      priorTrfOutParams.push(baseId);
    }
    if (!isAllCategories) {
      priorTrfOutQuery += ` AND category_id = ?`;
      priorTrfOutParams.push(categoryId);
    }
    const priorTrfOut = isAllBases ? 0 : ((db.prepare(priorTrfOutQuery).get(...priorTrfOutParams) as any)?.total || 0);

    // Prior Expenditures (< start)
    let priorExpQuery = `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures WHERE expenditure_date < ?`;
    const priorExpParams: any[] = [start];
    if (!isAllBases) {
      priorExpQuery += ` AND base_id = ?`;
      priorExpParams.push(baseId);
    }
    if (!isAllCategories) {
      priorExpQuery += ` AND category_id = ?`;
      priorExpParams.push(categoryId);
    }
    const priorExp = (db.prepare(priorExpQuery).get(...priorExpParams) as any)?.total || 0;

    const openingBalance = Math.max(0, initialSum + priorPurchases + priorTrfIn - priorTrfOut - priorExp);

    // 2. In-Period Movements (Between `start` and `end`)
    // Purchases
    let purchasesQuery = `
      SELECT p.*, b.name as base_name, c.name as category_name, u.name as created_by_name
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_categories c ON p.category_id = c.id
      JOIN users u ON p.created_by = u.id
      WHERE p.purchase_date >= ? AND p.purchase_date <= ?
    `;
    const purchasesParams: any[] = [start, end];
    if (!isAllBases) {
      purchasesQuery += ` AND p.base_id = ?`;
      purchasesParams.push(baseId);
    }
    if (!isAllCategories) {
      purchasesQuery += ` AND p.category_id = ?`;
      purchasesParams.push(categoryId);
    }
    purchasesQuery += ` ORDER BY p.purchase_date DESC`;
    const purchasesList = db.prepare(purchasesQuery).all(...purchasesParams) as any[];
    const totalPurchases = purchasesList.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalPurchasesCost = purchasesList.reduce((acc, p) => acc + (p.total_cost || 0), 0);

    // Transfers In
    let trfInQuery = `
      SELECT t.*, b1.name as origin_base_name, b2.name as destination_base_name, c.name as category_name, u.name as initiated_by_name
      FROM transfers t
      JOIN bases b1 ON t.origin_base_id = b1.id
      JOIN bases b2 ON t.destination_base_id = b2.id
      JOIN equipment_categories c ON t.category_id = c.id
      JOIN users u ON t.initiated_by = u.id
      WHERE t.transfer_date >= ? AND t.transfer_date <= ?
    `;
    const trfInParams: any[] = [start, end];
    if (!isAllBases) {
      trfInQuery += ` AND t.destination_base_id = ?`;
      trfInParams.push(baseId);
    }
    if (!isAllCategories) {
      trfInQuery += ` AND t.category_id = ?`;
      trfInParams.push(categoryId);
    }
    trfInQuery += ` ORDER BY t.transfer_date DESC`;
    const transfersInList = db.prepare(trfInQuery).all(...trfInParams) as any[];
    // For single base, sum transfers in. For all bases, inter-base moves cancel out in net aggregate, but are still listed!
    const totalTransfersIn = transfersInList.reduce((acc, t) => acc + (t.quantity || 0), 0);

    // Transfers Out
    let trfOutQuery = `
      SELECT t.*, b1.name as origin_base_name, b2.name as destination_base_name, c.name as category_name, u.name as initiated_by_name
      FROM transfers t
      JOIN bases b1 ON t.origin_base_id = b1.id
      JOIN bases b2 ON t.destination_base_id = b2.id
      JOIN equipment_categories c ON t.category_id = c.id
      JOIN users u ON t.initiated_by = u.id
      WHERE t.transfer_date >= ? AND t.transfer_date <= ?
    `;
    const trfOutParams: any[] = [start, end];
    if (!isAllBases) {
      trfOutQuery += ` AND t.origin_base_id = ?`;
      trfOutParams.push(baseId);
    }
    if (!isAllCategories) {
      trfOutQuery += ` AND t.category_id = ?`;
      trfOutParams.push(categoryId);
    }
    trfOutQuery += ` ORDER BY t.transfer_date DESC`;
    const transfersOutList = db.prepare(trfOutQuery).all(...trfOutParams) as any[];
    const totalTransfersOut = transfersOutList.reduce((acc, t) => acc + (t.quantity || 0), 0);

    // Net Movement: Purchases + Transfers In - Transfers Out
    // (If viewing all bases globally, internal transfers in and out are symmetric, so net movement equals total purchases)
    const effectiveTrfIn = isAllBases ? 0 : totalTransfersIn;
    const effectiveTrfOut = isAllBases ? 0 : totalTransfersOut;
    const netMovement = totalPurchases + effectiveTrfIn - effectiveTrfOut;

    // Expenditures (In-period)
    let expQuery = `
      SELECT e.*, b.name as base_name, c.name as category_name, u.name as authorized_by_name
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      JOIN equipment_categories c ON e.category_id = c.id
      JOIN users u ON e.authorized_by = u.id
      WHERE e.expenditure_date >= ? AND e.expenditure_date <= ?
    `;
    const expParams: any[] = [start, end];
    if (!isAllBases) {
      expQuery += ` AND e.base_id = ?`;
      expParams.push(baseId);
    }
    if (!isAllCategories) {
      expQuery += ` AND e.category_id = ?`;
      expParams.push(categoryId);
    }
    expQuery += ` ORDER BY e.expenditure_date DESC`;
    const expendituresList = db.prepare(expQuery).all(...expParams) as any[];
    const totalExpended = expendituresList.reduce((acc, e) => acc + (e.quantity || 0), 0);

    // Assigned Assets (Currently active or assigned in period)
    let asnQuery = `
      SELECT a.*, b.name as base_name, c.name as category_name, u.name as issued_by_name
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_categories c ON a.category_id = c.id
      JOIN users u ON a.issued_by = u.id
      WHERE a.status = 'ACTIVE'
    `;
    const asnParams: any[] = [];
    if (!isAllBases) {
      asnQuery += ` AND a.base_id = ?`;
      asnParams.push(baseId);
    }
    if (!isAllCategories) {
      asnQuery += ` AND a.category_id = ?`;
      asnParams.push(categoryId);
    }
    asnQuery += ` ORDER BY a.issue_date DESC`;
    const assignmentsList = db.prepare(asnQuery).all(...asnParams) as any[];
    const totalAssigned = assignmentsList.reduce((acc, a) => acc + (a.quantity || 0), 0);

    // Closing Balance: Opening Balance + Net Movement - Expended
    const closingBalance = Math.max(0, openingBalance + netMovement - totalExpended);

    // 3. Category Distribution breakdown
    const categoryStats = db.prepare(`
      SELECT c.id, c.name, c.code, c.unit_of_measure,
        COALESCE(SUM(i.current_quantity), 0) as current_stock,
        COUNT(DISTINCT i.id) as item_count
      FROM equipment_categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id ${!isAllBases ? 'AND i.base_id = ?' : ''}
      GROUP BY c.id
      ORDER BY current_stock DESC
    `).all(...(!isAllBases ? [baseId] : []));

    // 4. Asset level detailed summary
    let itemsQuery = `
      SELECT i.id, i.base_id, b.name as base_name, i.category_id, c.name as category_name,
             i.asset_name, i.model_number, i.initial_balance, i.current_quantity, i.minimum_threshold
      FROM inventory_items i
      JOIN bases b ON i.base_id = b.id
      JOIN equipment_categories c ON i.category_id = c.id
      WHERE 1=1
    `;
    const itemsParams: any[] = [];
    if (!isAllBases) {
      itemsQuery += ` AND i.base_id = ?`;
      itemsParams.push(baseId);
    }
    if (!isAllCategories) {
      itemsQuery += ` AND i.category_id = ?`;
      itemsParams.push(categoryId);
    }
    itemsQuery += ` ORDER BY b.name, i.asset_name`;
    const items = db.prepare(itemsQuery).all(...itemsParams) as any[];

    // Calculate individual asset movements
    const detailedAssets = items.map((item) => {
      const pCount = purchasesList
        .filter(p => p.base_id === item.base_id && p.asset_name === item.asset_name)
        .reduce((sum, p) => sum + p.quantity, 0);

      const tInCount = transfersInList
        .filter(t => t.destination_base_id === item.base_id && t.asset_name === item.asset_name)
        .reduce((sum, t) => sum + t.quantity, 0);

      const tOutCount = transfersOutList
        .filter(t => t.origin_base_id === item.base_id && t.asset_name === item.asset_name)
        .reduce((sum, t) => sum + t.quantity, 0);

      const eCount = expendituresList
        .filter(e => e.base_id === item.base_id && e.asset_name === item.asset_name)
        .reduce((sum, e) => sum + e.quantity, 0);

      const aCount = assignmentsList
        .filter(a => a.base_id === item.base_id && a.asset_name === item.asset_name)
        .reduce((sum, a) => sum + a.quantity, 0);

      const assetNet = pCount + tInCount - tOutCount;
      const assetOpening = item.initial_balance;
      const assetClosing = Math.max(0, assetOpening + assetNet - eCount);

      return {
        id: item.id,
        baseName: item.base_name,
        categoryName: item.category_name,
        assetName: item.asset_name,
        modelNumber: item.model_number,
        openingBalance: assetOpening,
        purchases: pCount,
        transfersIn: tInCount,
        transfersOut: tOutCount,
        netMovement: assetNet,
        expended: eCount,
        assigned: aCount,
        closingBalance: assetClosing,
        onHandAvailable: item.current_quantity,
        minimumThreshold: item.minimum_threshold,
        isLowStock: item.current_quantity <= item.minimum_threshold,
      };
    });

    res.json({
      filters: {
        startDate: start,
        endDate: end,
        baseId: baseId || 'all',
        categoryId: categoryId || 'all',
        enforcedBase: user.role === 'commander' ? user.base_id : null,
      },
      summary: {
        openingBalance,
        totalPurchases,
        totalPurchasesCost,
        totalTransfersIn,
        totalTransfersOut,
        netMovement,
        totalAssigned,
        totalExpended,
        closingBalance,
      },
      popupBreakdown: {
        purchases: purchasesList,
        transfersIn: transfersInList,
        transfersOut: transfersOutList,
      },
      categoryStats,
      detailedAssets,
      assignments: assignmentsList,
      expenditures: expendituresList,
    });
  } catch (err: any) {
    console.error('[DASHBOARD ERROR]:', err);
    res.status(500).json({ error: 'Failed to compute dashboard metrics', details: err.message });
  }
});
