import dotenv from 'dotenv';
dotenv.config();

import pool from './src/db';

async function checkAdmin() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT username, password_hash, is_active FROM admin_users WHERE username = $1', ['admin']);
    
    if (res.rows.length === 0) {
      console.log('❌ Admin user not found in database');
    } else {
      console.log('✅ Admin user found:');
      console.log('   Username:', res.rows[0].username);
      console.log('   Active:', res.rows[0].is_active);
      console.log('   Hash length:', res.rows[0].password_hash.length);
      console.log('   Hash starts with:', res.rows[0].password_hash.substring(0, 10));
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', (error as any).message);
    process.exit(1);
  }
}

checkAdmin();
