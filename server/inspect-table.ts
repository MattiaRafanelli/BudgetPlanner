import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db';

async function inspectTable() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'admin_users'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 admin_users Table Structure:\n');
    console.log(result.rows);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectTable();
