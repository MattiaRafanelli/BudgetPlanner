import fs from 'fs';
import path from 'path';
import pool from '../db';

export async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      console.log(`  📝 Running ${file}...`);
      await pool.query(sql);
      console.log(`  ✅ ${file} completed`);
    }

    console.log('✅ All migrations completed successfully\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
