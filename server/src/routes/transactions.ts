import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// GET /api/transactions/summary  — must be before /:id
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { month, year } = req.query;
    const values: (string | number)[] = [userId];
    let where = 'WHERE user_id = $1';

    if (year) {
      values.push(Number(year));
      where += ` AND EXTRACT(YEAR FROM transaction_date AT TIME ZONE 'UTC') = $${values.length}`;
    }
    if (month) {
      values.push(Number(month));
      where += ` AND EXTRACT(MONTH FROM transaction_date AT TIME ZONE 'UTC') = $${values.length}`;
    }

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN transaction_type = 'income'  THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
         COALESCE(SUM(CASE WHEN transaction_type = 'income'  THEN amount ELSE -amount END), 0) AS balance
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
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { month, year, category, account } = req.query;
    const values: (string | number)[] = [userId];
    let where = 'WHERE t.user_id = $1';

    if (year) {
      values.push(Number(year));
      where += ` AND EXTRACT(YEAR FROM t.transaction_date AT TIME ZONE 'UTC') = $${values.length}`;
    }
    if (month) {
      values.push(Number(month));
      where += ` AND EXTRACT(MONTH FROM t.transaction_date AT TIME ZONE 'UTC') = $${values.length}`;
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
      `SELECT t.*, c.name AS category_name, COALESCE(c.icon, 'Tag') AS category_icon, COALESCE(c.color, '#999999') AS category_color,
              a.name AS account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts   a ON t.account_id  = a.id
       ${where}
       ORDER BY t.transaction_date DESC, t.created_at DESC`,
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
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = await pool.query(
      `SELECT t.*, c.name AS category_name, a.name AS account_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts   a ON t.account_id  = a.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, userId]
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
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { account_id, category_id, amount, type, description, date } = req.body;
    const result = await pool.query(
      `INSERT INTO transactions (user_id, account_id, category_id, amount, transaction_type, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, account_id, category_id, amount, type, description, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { account_id, category_id, amount, type, description, date } = req.body;
    const result = await pool.query(
      `UPDATE transactions
       SET account_id = $1, category_id = $2, amount = $3, transaction_type = $4,
           description = $5, transaction_date = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [account_id, category_id, amount, type, description, date, id, userId]
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
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
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
