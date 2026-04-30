import { Router, Request, Response, NextFunction } from 'express';
import pool from '../db';

const router = Router();

// ============================================================================
// GET /api/categories  (optional ?type=expense|income)
// ============================================================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const values: (string | undefined)[] = [];
    let where = '';

    // Filter by type if provided
    if (type === 'expense' || type === 'income') {
      where = 'WHERE type = $1';
      values.push(type as string);
    }

    const result = await pool.query(
      `SELECT id, name, type, icon, color, is_builtin, created_at 
       FROM categories 
       ${where} 
       ORDER BY is_builtin DESC, name ASC`,
      values.length > 0 ? values : undefined
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('❌ GET /api/categories error:', err);
    next(err);
  }
});

// ============================================================================
// GET /api/categories/:id
// ============================================================================
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid category ID format' });
      return;
    }

    const result = await pool.query(
      `SELECT id, name, type, icon, color, is_builtin, created_at 
       FROM categories 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('❌ GET /api/categories/:id error:', err);
    next(err);
  }
});

// ============================================================================
// POST /api/categories
// ============================================================================
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, icon, color } = req.body;

    // Validation
    if (!name || !type) {
      res.status(400).json({ error: 'Missing required fields: name, type' });
      return;
    }

    if (type !== 'expense' && type !== 'income') {
      res.status(400).json({ error: 'Invalid type. Must be "expense" or "income"' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO categories (name, type, icon, color, is_builtin)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, name, type, icon, color, is_builtin, created_at`,
      [name, type, icon || null, color || '#3b82f6']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully',
    });
  } catch (err: any) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      console.warn('⚠️ Category name already exists:', err.detail);
      res.status(409).json({ error: 'Category name already exists' });
      return;
    }
    console.error('❌ POST /api/categories error:', err);
    next(err);
  }
});

// ============================================================================
// PUT /api/categories/:id  (only update non-built-in categories)
// ============================================================================
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid category ID format' });
      return;
    }

    // Validation
    if (!name) {
      res.status(400).json({ error: 'Missing required field: name' });
      return;
    }

    const result = await pool.query(
      `UPDATE categories 
       SET name = $1, icon = $2, color = $3, updated_at = NOW()
       WHERE id = $4 AND is_builtin = false
       RETURNING id, name, type, icon, color, is_builtin, updated_at`,
      [name, icon || null, color || '#3b82f6', id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ 
        error: 'Category not found or is built-in (built-in categories cannot be modified)' 
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully',
    });
  } catch (err: any) {
    // Handle unique constraint violation
    if (err.code === '23505') {
      console.warn('⚠️ Category name already exists:', err.detail);
      res.status(409).json({ error: 'Category name already exists' });
      return;
    }
    console.error('❌ PUT /api/categories/:id error:', err);
    next(err);
  }
});

// ============================================================================
// DELETE /api/categories/:id  (only delete non-built-in categories)
// ============================================================================
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      res.status(400).json({ error: 'Invalid category ID format' });
      return;
    }

    const result = await pool.query(
      `DELETE FROM categories 
       WHERE id = $1 AND is_builtin = false 
       RETURNING id, name`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ 
        error: 'Category not found or is built-in (built-in categories cannot be deleted)' 
      });
      return;
    }

    res.json({
      success: true,
      data: { deleted: id, name: result.rows[0].name },
      message: 'Category deleted successfully',
    });
  } catch (err: any) {
    // Handle foreign key constraint violation
    if (err.code === '23503') {
      console.warn('⚠️ Cannot delete category with existing transactions:', err.detail);
      res.status(409).json({ 
        error: 'Cannot delete category with existing transactions. Delete related transactions first.' 
      });
      return;
    }
    console.error('❌ DELETE /api/categories/:id error:', err);
    next(err);
  }
});

export default router;