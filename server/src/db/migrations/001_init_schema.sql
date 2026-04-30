-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'credit', 'cash', 'investment')),
  currency VARCHAR(3) NOT NULL DEFAULT 'CHF',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  color VARCHAR(7),
  icon VARCHAR(50),
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  recurrence VARCHAR(50) DEFAULT 'none',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create budget_limits table
CREATE TABLE IF NOT EXISTS budget_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  period VARCHAR(50) NOT NULL DEFAULT 'month',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_category_id ON budget_limits(category_id);

-- Insert default categories
INSERT INTO categories (id, name, type, is_custom) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Salary', 'income', false),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bonus', 'income', false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Other Income', 'income', false),
  ('550e8400-e29b-41d4-a716-446655440010', 'Food & Dining', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440011', 'Groceries', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440012', 'Restaurants', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440020', 'Transport', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440021', 'Public Transport', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440022', 'Fuel', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440030', 'Shopping', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440031', 'Clothing', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440032', 'Home & Garden', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440040', 'Bills & Utilities', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440041', 'Rent', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440042', 'Electricity', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440050', 'Entertainment', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440051', 'Movies & Streaming', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440052', 'Gaming', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440060', 'Health & Fitness', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440061', 'Gym Membership', 'expense', false),
  ('550e8400-e29b-41d4-a716-446655440062', 'Medical', 'expense', false)
ON CONFLICT (id) DO NOTHING;
