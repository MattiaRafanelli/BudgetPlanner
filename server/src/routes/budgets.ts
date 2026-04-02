import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// GET /api/budgets/status  — must be before /:id
router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const year  = now.getFullYear();
    const month = now.getMonth() + 1;

    const result = await pool.query(
      `SELECT
         b.id,
         b.amount      AS budget_amount,
         b.period,
         c.name        AS category_name,
         c.icon        AS category_icon,
         c.color       AS category_color,
         COALESCE(SUM(t.amount), 0) AS actual_spent,
         b.amount - COALESCE(SUM(t.amount), 0) AS remaining
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       LEFT JOIN transactions t
         ON t.category_id = b.category_id
         AND t.type = 'expense'
         AND EXTRACT(YEAR  FROM t.date AT TIME ZONE 'UTC') = $1
         AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = $2
       GROUP BY b.id, b.amount, b.period, c.name, c.icon, c.color
       ORDER BY c.name ASC`,
      [year, month]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/budgets
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY c.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/budgets
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category_id, amount, period = 'monthly', start_date } = req.body;
    const result = await pool.query(
      `INSERT INTO budgets (category_id, amount, period, start_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category_id, amount, period, start_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { category_id, amount, period, start_date } = req.body;
    const result = await pool.query(
      `UPDATE budgets SET category_id = $1, amount = $2, period = $3, start_date = $4
       WHERE id = $5
       RETURNING *`,
      [category_id, amount, period, start_date, id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Budget not found' });
      return;
    }
    res.json({ deleted: id });
  } catch (err) {
    next(err);
  }
});

export default router;
