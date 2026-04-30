import express, { Request, Response } from 'express';
import pool from '../db';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  generateTemporaryPassword,
} from '../utils/auth';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// ============================================================================
// GENERAL LOGIN (Admin or User)
// ============================================================================

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const isDev = process.env.NODE_ENV === 'development';

    if (!username || !password) {
      res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
      return;
    }

    if (isDev) {
      console.log(`\n🔐 Anmeldeversuch - Benutzername: "${username}"`);
    }

    // Try admin users first
    let result = await pool.query(
      `SELECT id, password_hash, must_change_password, is_active, 'admin' as role, username
       FROM admin_users 
       WHERE username = $1`,
      [username]
    );

    let userType = 'admin';

    // If not found, try regular users
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, password_hash, must_change_password, is_active, 'user' as role, username, email, first_name, last_name
         FROM users 
         WHERE username = $1 OR email = $1`,
        [username]
      );
      userType = 'user';
    }

    if (result.rows.length === 0) {
      if (isDev) console.log(`❌ Benutzer nicht gefunden: "${username}"`);
      res.status(401).json({ error: 'Ungültiger Benutzername oder Passwort' });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      if (isDev) console.log(`❌ Konto inaktiv`);
      res.status(403).json({ error: 'Benutzerkonto ist inaktiv' });
      return;
    }

    if (isDev) console.log(`✅ Benutzer gefunden (${userType})`);

    const passwordMatch = await comparePasswords(password, user.password_hash);

    if (!passwordMatch) {
      if (isDev) console.log(`❌ Passwort stimmt nicht\n`);
      res.status(401).json({ error: 'Ungültiger Benutzername oder Passwort' });
      return;
    }

    // Update last login
    const table = userType === 'admin' ? 'admin_users' : 'users';
    await pool.query(
      `UPDATE ${table} SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );

    const token = generateToken(user.id, userType === 'admin');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// ============================================================================
// CHANGE PASSWORD (Admin or User)
// ============================================================================

router.post(
  '/change-password',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;
      const isAdmin = req.user?.isAdmin;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ error: 'Aktuelles Passwort und neues Passwort sind erforderlich' });
        return;
      }

      if (newPassword.length < 8) {
        res
          .status(400)
          .json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });
        return;
      }

      // Get current password hash
      let table = isAdmin ? 'admin_users' : 'users';
      const result = await pool.query(
        `SELECT password_hash FROM ${table} WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      const passwordMatch = await comparePasswords(
        currentPassword,
        result.rows[0].password_hash
      );

      if (!passwordMatch) {
        res.status(401).json({ error: 'Ungültiges aktuelles Passwort' });
        return;
      }

      // Hash and update new password
      const newHash = await hashPassword(newPassword);
      await pool.query(
        `UPDATE ${table} 
         SET password_hash = $1, must_change_password = false, updated_at = NOW()
         WHERE id = $2`,
        [newHash, userId]
      );

      res.json({ message: 'Passwort erfolgreich geändert' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// ============================================================================
// GET PROFILE
// ============================================================================

router.get(
  '/profile',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const isAdmin = req.user?.isAdmin;

      const table = isAdmin ? 'admin_users' : 'users';
      const result = await pool.query(
        `SELECT id, username, email, first_name, last_name, is_active, must_change_password, created_at
         FROM ${table}
         WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

// List all users
router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT id, username, first_name, last_name, is_active, must_change_password, last_login, created_at
         FROM users 
         ORDER BY created_at DESC`
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// Create new user (Admin only)
router.post(
  '/users',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, firstName, lastName } = req.body;
      const adminId = req.user?.userId;

      if (!username) {
        res.status(400).json({ error: 'Benutzername ist erforderlich' });
        return;
      }

      if (!firstName || !lastName) {
        res.status(400).json({ error: 'Vorname und Nachname sind erforderlich' });
        return;
      }

      // Check if username already exists
      const existingUser = await pool.query(
        `SELECT id FROM users WHERE username = $1`,
        [username]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'Benutzername existiert bereits' });
        return;
      }

      // Generate temporary password
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(tempPassword);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, is_active, must_change_password, created_by)
         VALUES ($1, NULL, $2, $3, $4, true, true, $5)
         RETURNING id, username, first_name, last_name, is_active, created_at`,
        [username, passwordHash, firstName, lastName, adminId]
      );

      // Log audit
      await pool.query(
        `INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [
          adminId,
          'CREATE_USER',
          result.rows[0].id,
          JSON.stringify({ username, firstName, lastName }),
        ]
      );

      res.status(201).json({
        user: result.rows[0],
        temporaryPassword: tempPassword,
        message: 'Benutzer erstellt. Teilen Sie das temporäre Passwort sicher mit dem Benutzer.',
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// Update user (Admin only)
router.put(
  '/users/:userId',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { email, firstName, lastName, isActive } = req.body;
      const adminId = req.user?.userId;

      const result = await pool.query(
        `UPDATE users 
         SET email = COALESCE($1, email),
             first_name = COALESCE($2, first_name),
             last_name = COALESCE($3, last_name),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, username, first_name, last_name, is_active, created_at`,
        [email, firstName, lastName, isActive, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      // Log audit
      await pool.query(
        `INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [adminId, 'UPDATE_USER', userId, JSON.stringify(req.body)]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// Delete user (Admin only)
router.delete(
  '/users/:userId',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.userId;

      const result = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      // Log audit
      await pool.query(
        `INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [adminId, 'DELETE_USER', userId, JSON.stringify({ deletedUserId: userId })]
      );

      res.json({ message: 'Benutzer erfolgreich gelöscht' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// ============================================================================
// ADMIN PASSWORD MANAGEMENT (Admin only)
// ============================================================================

// Assign/Set password for user
router.post(
  '/users/:userId/assign-password',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { password } = req.body;
      const adminId = req.user?.userId;

      if (!password || password.length < 8) {
        res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });
        return;
      }

      const passwordHash = await hashPassword(password);

      const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, must_change_password = true, updated_at = NOW()
         WHERE id = $2
         RETURNING id, username, email, first_name, last_name`,
        [passwordHash, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      // Log audit
      await pool.query(
        `INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4)`,
        [adminId, 'ASSIGN_PASSWORD', userId, JSON.stringify({ userId })]
      );

      res.json({
        message: 'Passwort erfolgreich zugewiesen. Benutzer muss es beim nächsten Login ändern.',
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Assign password error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

// Reset user password to temporary password
router.post(
  '/users/:userId/reset-password',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.userId;

      // Generate new temporary password
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(tempPassword);

      const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, must_change_password = true, updated_at = NOW()
         WHERE id = $2
         RETURNING id, username, email, first_name, last_name`,
        [passwordHash, userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Benutzer nicht gefunden' });
        return;
      }

      // Log audit
      await pool.query(
        `INSERT INTO admin_audit_log (admin_id, action, target_user_id)
         VALUES ($1, $2, $3)`,
        [adminId, 'RESET_PASSWORD', userId]
      );

      res.json({
        message: 'Passwort erfolgreich zurückgesetzt',
        temporaryPassword: tempPassword,
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Interner Serverfehler' });
    }
  }
);

export default router;
