import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// GET /api/categories  (optional ?type=expense|income)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const values: string[] = [];
    let where = '';
    if (type === 'expense' || type === 'income') {
      where = 'WHERE type = $1';
      values.push(type);
    }
    const result = await pool.query(
      `SELECT * FROM categories ${where} ORDER BY is_builtin DESC, name ASC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, icon, color } = req.body;
    const result = await pool.query(
      `INSERT INTO categories (name, type, icon, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, icon, color]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const result = await pool.query(
      `UPDATE categories SET name = $1, icon = $2, color = $3
       WHERE id = $4 AND is_builtin = false
       RETURNING *`,
      [name, icon, color, id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Category not found or is built-in' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id  (only non-built-in)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM categories WHERE id = $1 AND is_builtin = false RETURNING id`,
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Category not found or is built-in' });
      return;
    }
    res.json({ deleted: id });
  } catch (err) {
    next(err);
  }
});

export default router;
