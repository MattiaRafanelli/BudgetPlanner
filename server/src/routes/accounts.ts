import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// ============================================================================
// GET /api/accounts - Get all accounts for current user
// ============================================================================
router.get('/', authMiddleware, async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  try {
    // For now, if no user_id, return empty array (not authenticated)
    // In production, this should always have req.userId due to authMiddleware
    if (!req.userId) {
      res.json([]);
      return;
    }

    const result = await pool.query(
      `SELECT id, user_id, name, account_type as type, starting_balance as balance, currency, color, icon, is_active, created_at, updated_at 
       FROM accounts WHERE user_id = $1 ORDER BY name ASC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// POST /api/accounts - Create account for current user
// ============================================================================
router.post('/', authMiddleware, async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, type = 'bank', balance = 0, currency = 'CHF', color, icon } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Account name is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO accounts (user_id, name, account_type, starting_balance, current_balance, currency, color, icon, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING id, user_id, name, account_type as type, starting_balance as balance, currency, color, icon, is_active, created_at, updated_at`,
      [req.userId, name, type, balance, balance, currency, color || '#8B5CF6', icon || 'Wallet']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// PUT /api/accounts/:id - Update account (only own accounts)
// ============================================================================
router.put('/:id', authMiddleware, async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { name, type, balance, currency, color, icon, is_active } = req.body;
    
    // First verify this account belongs to the current user
    const verify = await pool.query(
      'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (verify.rowCount === 0) {
      res.status(404).json({ error: 'Account not found or unauthorized' });
      return;
    }

    const result = await pool.query(
      `UPDATE accounts 
       SET name = COALESCE($1, name),
           account_type = COALESCE($2, account_type),
           starting_balance = COALESCE($3, starting_balance),
           current_balance = COALESCE($3, current_balance),
           currency = COALESCE($4, currency),
           color = COALESCE($5, color),
           icon = COALESCE($6, icon),
           is_active = COALESCE($7, is_active)
       WHERE id = $8 AND user_id = $9
       RETURNING id, user_id, name, account_type as type, starting_balance as balance, currency, color, icon, is_active, created_at, updated_at`,
      [name, type, balance, currency, color, icon, is_active, id, req.userId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// DELETE /api/accounts/:id - Delete account (only own accounts)
// ============================================================================
router.delete('/:id', authMiddleware, async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    
    // First verify this account belongs to the current user
    const verify = await pool.query(
      'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (verify.rowCount === 0) {
      res.status(404).json({ error: 'Account not found or unauthorized' });
      return;
    }

    await pool.query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
