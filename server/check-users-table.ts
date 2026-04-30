import dotenv from 'dotenv';
dotenv.config();
import pool from './src/db';

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('\n📊 users Table Struktur:\n');
    console.log(result.rows);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
checkTable();
