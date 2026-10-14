import { Router } from 'express';
import { db } from '../db/database.ts';

export const basesRouter = Router();

// GET /api/bases - List all military bases
basesRouter.get('/', (req, res) => {
  const user = req.user!;
  let sql = 'SELECT * FROM bases ORDER BY name ASC';
  const bases = db.prepare(sql).all();
  res.json({ bases });
});

// GET /api/bases/categories - List equipment categories
basesRouter.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM equipment_categories ORDER BY name ASC').all();
  res.json({ categories });
});

// GET /api/bases/inventory - List inventory items with stock level
basesRouter.get('/inventory', (req, res) => {
  const user = req.user!;
  let { baseId, categoryId } = req.query as { baseId?: string; categoryId?: string };

  if (user.role === 'commander' && user.base_id) {
    baseId = user.base_id;
  }

  let sql = `
    SELECT i.*, b.name as base_name, b.code as base_code, c.name as category_name, c.unit_of_measure
    FROM inventory_items i
    JOIN bases b ON i.base_id = b.id
    JOIN equipment_categories c ON i.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (baseId && baseId !== 'all') {
    sql += ` AND i.base_id = ?`;
    params.push(baseId);
  }
  if (categoryId && categoryId !== 'all') {
    sql += ` AND i.category_id = ?`;
    params.push(categoryId);
  }

  sql += ` ORDER BY b.name, i.asset_name`;
  const items = db.prepare(sql).all(...params);
  res.json({ items });
});
