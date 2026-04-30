// ⚠️ CRITICAL: Load environment variables FIRST!
import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import pool from './src/db';

async function seedAdminUser() {
  try {
    console.log('\n🌱 BudgetPlanner Admin Seeder\n');
    console.log('=' .repeat(50));

    const password = process.env.ADMIN_PASSWORD || 'admin123';
    console.log(`🔐 Password to hash: "${password}"`);
    console.log(`⏳ Hashing with bcrypt (10 rounds)...`);

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(`\n✅ Hash generated successfully`);
    console.log(`📄 Hash: ${passwordHash}`);
    console.log(`   Type: ${passwordHash.substring(0, 4)} (should be $2b$)`);

    // Test that verification works BEFORE inserting into DB
    console.log(`\n🧪 Testing password verification...`);
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    console.log(`   Password "${password}" matches hash: ${isValidPassword ? '✅ YES' : '❌ NO'}`);

    if (!isValidPassword) {
      throw new Error('❌ Password verification failed! Hash is invalid.');
    }

    // Test with wrong password
    const isInvalidPassword = await bcrypt.compare('wrongpassword', passwordHash);
    console.log(`   Password "wrongpassword" matches hash: ${isInvalidPassword ? '❌ YES (BAD!)' : '✅ NO (Good)'}`);

    if (isInvalidPassword) {
      throw new Error('❌ Wrong password matched! Hash is corrupted.');
    }

    // Now insert into database
    console.log(`\n💾 Inserting admin user into database...`);
    
    // First delete existing admin user if it exists
    await pool.query(`DELETE FROM admin_users WHERE username = 'admin'`);
    
    // Then insert the new one
    const result = await pool.query(
      `INSERT INTO admin_users (username, password_hash, is_active, must_change_password)
       VALUES ('admin', $1, true, false)
       RETURNING id, username, password_hash`,
      [passwordHash]
    );

    const adminUser = result.rows[0];
    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);

    // Verify that the hash in DB matches
    console.log(`\n🔍 Verifying hash in database...`);
    const dbResult = await pool.query(
      `SELECT password_hash FROM admin_users WHERE username = 'admin'`
    );

    if (dbResult.rows.length === 0) {
      throw new Error('❌ Admin user not found in database after insert!');
    }

    const dbHash = dbResult.rows[0].password_hash;
    console.log(`   DB Hash: ${dbHash}`);
    console.log(`   Matches generated hash: ${dbHash === passwordHash ? '✅ YES' : '❌ NO'}`);

    // Test login with the DB hash
    console.log(`\n🔐 Testing login with DB hash...`);
    const loginTest = await bcrypt.compare(password, dbHash);
    console.log(`   Can login with "${password}": ${loginTest ? '✅ YES' : '❌ NO'}`);

    if (!loginTest) {
      throw new Error('❌ Login test failed! Database hash is invalid.');
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`\n✅ SUCCESS! Admin user is ready.\n`);
    console.log(`📝 Login Credentials:`);
    console.log(`   Username: admin`);
    console.log(`   Password: ${password}\n`);
    console.log(`🚀 Start the app and test login at http://localhost:5173\n`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ ERROR: ${error instanceof Error ? error.message : error}\n`);
    console.error(error);
    process.exit(1);
  }
}

seedAdminUser();
