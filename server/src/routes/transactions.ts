import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// GET /api/transactions/summary  — must be before /:id
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year } = req.query;
    const values: (string | number)[] = [];
    let where = 'WHERE 1=1';

    if (year) {
      values.push(Number(year));
      where += ` AND EXTRACT(YEAR FROM date AT TIME ZONE 'UTC') = $${values.length}`;
    }
    if (month) {
      values.push(Number(month));
      where += ` AND EXTRACT(MONTH FROM date AT TIME ZONE 'UTC') = $${values.length}`;
    }

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END), 0) AS balance
       FROM transactions ${where}`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions  (?month=&year=&category=&account=)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { month, year, category, account } = req.query;
    const values: (string | number)[] = [];
    let where = 'WHERE 1=1';

    if (year) {
      values.push(Number(year));
      where += ` AND EXTRACT(YEAR FROM t.date AT TIME ZONE 'UTC') = $${values.length}`;
    }
    if (month) {
      values.push(Number(month));
      where += ` AND EXTRACT(MONTH FROM t.date AT TIME ZONE 'UTC') = $${values.length}`;
    }
    if (category) {
      values.push(category as string);
      where += ` AND t.category_id = $${values.length}`;
    }
    if (account) {
      values.push(account as string);
      where += ` AND t.account_id = $${values.length}`;
    }

    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
              a.name AS account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts   a ON t.account_id  = a.id
       ${where}
       ORDER BY t.date DESC, t.created_at DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, a.name AS account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts   a ON t.account_id  = a.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id, category_id, amount, type, description, date } = req.body;
    const result = await pool.query(
      `INSERT INTO transactions (account_id, category_id, amount, type, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [account_id, category_id, amount, type, description, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { account_id, category_id, amount, type, description, date } = req.body;
    const result = await pool.query(
      `UPDATE transactions
       SET account_id = $1, category_id = $2, amount = $3, type = $4,
           description = $5, date = $6
       WHERE id = $7
       RETURNING *`,
      [account_id, category_id, amount, type, description, date, id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ deleted: id });
  } catch (err) {
    next(err);
  }
});

export default router;
