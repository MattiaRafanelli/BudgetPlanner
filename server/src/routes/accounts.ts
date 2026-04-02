import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// GET /api/accounts
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, balance = 0, currency = 'CHF' } = req.body;
    const result = await pool.query(
      `INSERT INTO accounts (name, type, balance, currency)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, type, balance, currency]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, type, balance, currency } = req.body;
    const result = await pool.query(
      `UPDATE accounts SET name = $1, type = $2, balance = $3, currency = $4
       WHERE id = $5
       RETURNING *`,
      [name, type, balance, currency, id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM accounts WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ deleted: id });
  } catch (err) {
    next(err);
  }
});

export default router;
