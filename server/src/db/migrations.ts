import pool from '../db';

/**
 * Run all database migrations
 * Creates tables if they don't exist
 */
export const runMigrations = async () => {
  console.log('\n🔄 [MIGRATIONS] Running database migrations...\n');

  const client = await pool.connect();

  try {
    // ========================================================================
    // 1. USERS TABLE
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ [MIGRATIONS] users table created');

    // ========================================================================
    // 2. ACCOUNTS TABLE
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        account_type VARCHAR(50) NOT NULL,
        currency VARCHAR(3) DEFAULT 'EUR',
        starting_balance DECIMAL(15, 2) DEFAULT 0,
        current_balance DECIMAL(15, 2) DEFAULT 0,
        color VARCHAR(7),
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Ensure all necessary columns exist (add them individually if missing)
    const accountColumns = ['account_type', 'currency', 'starting_balance', 'current_balance', 'color', 'icon', 'is_active'];
    for (const col of accountColumns) {
      try {
        let query = '';
        switch (col) {
          case 'account_type':
            query = `ALTER TABLE accounts ADD COLUMN account_type VARCHAR(50) NOT NULL DEFAULT 'bank';`;
            break;
          case 'currency':
            query = `ALTER TABLE accounts ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';`;
            break;
          case 'starting_balance':
            query = `ALTER TABLE accounts ADD COLUMN starting_balance DECIMAL(15, 2) DEFAULT 0;`;
            break;
          case 'current_balance':
            query = `ALTER TABLE accounts ADD COLUMN current_balance DECIMAL(15, 2) DEFAULT 0;`;
            break;
          case 'color':
            query = `ALTER TABLE accounts ADD COLUMN color VARCHAR(7);`;
            break;
          case 'icon':
            query = `ALTER TABLE accounts ADD COLUMN icon VARCHAR(50);`;
            break;
          case 'is_active':
            query = `ALTER TABLE accounts ADD COLUMN is_active BOOLEAN DEFAULT TRUE;`;
            break;
        }
        if (query) await client.query(query);
      } catch (e: any) {
        // Column might already exist, ignore
        if (!e.message.includes('already exists')) {
          console.warn(`⚠️  Could not add column ${col}:`, e.message);
        }
      }
    }
    
    console.log('✓ [MIGRATIONS] accounts table created');

    // ========================================================================
    // 3. CATEGORIES TABLE
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category_type VARCHAR(50) NOT NULL,
        color VARCHAR(7),
        icon VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, name)
      );
    `);
    
    // Ensure category_type column exists
    try {
      await client.query(`
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS category_type VARCHAR(50) NOT NULL DEFAULT 'expense';
      `);
    } catch (e: any) {
      // Column might already exist
    }
    
    console.log('✓ [MIGRATIONS] categories table created');

    // ========================================================================
    // 4. TRANSACTIONS TABLE
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
        description VARCHAR(500),
        amount DECIMAL(15, 2) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Ensure transaction_type and transaction_date columns exist
    try {
      await client.query(`
        ALTER TABLE transactions 
        ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) NOT NULL DEFAULT 'expense';
      `);
    } catch (e: any) {
      // Column might already exist
    }
    
    try {
      await client.query(`
        ALTER TABLE transactions 
        ADD COLUMN IF NOT EXISTS transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;
      `);
    } catch (e: any) {
      // Column might already exist
    }
    
    console.log('✓ [MIGRATIONS] transactions table created');

    // ========================================================================
    // 5. BUDGETS TABLE
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        budget_type VARCHAR(50) NOT NULL,
        month DATE NOT NULL,
        total_amount DECIMAL(15, 2) NOT NULL,
        spent_amount DECIMAL(15, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, month)
      );
    `);
    console.log('✓ [MIGRATIONS] budgets table created');

    // ========================================================================
    // 6. BUDGET_CATEGORIES TABLE (Join Table)
    // ========================================================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS budget_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        allocated_amount DECIMAL(15, 2) NOT NULL,
        spent_amount DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(budget_id, category_id)
      );
    `);
    console.log('✓ [MIGRATIONS] budget_categories table created');

    // 7. CREATE INDEXES for Performance
    // Only create if the columns exist
    
    // Transactions indexes
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
        ON transactions(user_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_account_id 
        ON transactions(account_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_category_id 
        ON transactions(category_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date 
        ON transactions(transaction_date);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }
    console.log('✓ [MIGRATIONS] Indexes created for transactions');

    // Accounts indexes
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_accounts_user_id 
        ON accounts(user_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }
    console.log('✓ [MIGRATIONS] Indexes created for accounts');

    // Categories indexes
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_categories_user_id 
        ON categories(user_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }
    console.log('✓ [MIGRATIONS] Indexes created for categories');

    // Budgets indexes
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_budgets_user_id 
        ON budgets(user_id);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }

    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_budgets_month 
        ON budgets(month);
      `);
    } catch (error: any) {
      if (!error.message.includes('does not exist')) throw error;
    }
    console.log('✓ [MIGRATIONS] Indexes created for budgets');

    console.log('\n✅ [MIGRATIONS] All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ [MIGRATIONS] Migration failed:');
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
