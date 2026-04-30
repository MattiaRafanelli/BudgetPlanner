import fs from 'fs';
import path from 'path';
import pool from '../db';

export async function runMigrations(retries = 3, delay = 2000) {
  console.log('🔄 Running database migrations...');

  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
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
        try {
          await pool.query(sql);
          console.log(`  ✅ ${file} completed`);
        } catch (queryError: any) {
          // Ignoriere "table already exists" Fehler (idempotent)
          if (queryError.message?.includes('already exists')) {
            console.log(`  ⓘ ${file} already applied (skipping)`);
          } else {
            throw queryError;
          }
        }
      }

      console.log('✅ All migrations completed successfully\n');
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.error(`❌ Migration attempt ${attempt} failed, retrying in ${delay}ms...`);
        console.error(`   Error: ${(error as Error).message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`❌ Migration failed after ${retries} attempts:`, lastError);
  throw lastError;
}
