-- ============================================================================
-- BudgetPlanner Database Schema
-- PostgreSQL 16 on Azure (optimiert, ohne pgcrypto)
-- ============================================================================

-- ============================================================================
-- 1. ENUM Types
-- ============================================================================

CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE account_type AS ENUM ('bank', 'cash', 'credit_card', 'savings');

-- ============================================================================
-- 2. Categories Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  type       transaction_type NOT NULL,
  icon       VARCHAR(50),
  color      VARCHAR(20) NOT NULL DEFAULT '#3b82f6',
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================================================
-- 3. Accounts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  type        account_type NOT NULL,
  balance     DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency    VARCHAR(10) NOT NULL DEFAULT 'CHF',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_is_active ON accounts(is_active);

-- ============================================================================
-- 4. Transactions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount       DECIMAL(15, 2) NOT NULL,
  type         transaction_type NOT NULL,
  description  VARCHAR(255),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- ============================================================================
-- 5. Budgets Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount      DECIMAL(15, 2) NOT NULL,
  period      budget_period NOT NULL DEFAULT 'monthly',
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_is_active ON budgets(is_active);

-- ============================================================================
-- 6. Recurring Transactions Table (optional für zukünftige Features)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount        DECIMAL(15, 2) NOT NULL,
  type          transaction_type NOT NULL,
  description   VARCHAR(255),
  frequency     VARCHAR(20) NOT NULL DEFAULT 'monthly',
  next_date     DATE NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);

-- ============================================================================
-- 7. Trigger Function for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. Insert Default Categories
-- ============================================================================

-- Expense Categories
INSERT INTO categories (name, type, icon, color, is_builtin) VALUES
  ('Housing',         'expense', 'home',               '#6366f1', true),
  ('Food & Dining',   'expense', 'utensils',           '#f59e0b', true),
  ('Transport',       'expense', 'car',                '#3b82f6', true),
  ('Healthcare',      'expense', 'heart-pulse',        '#ef4444', true),
  ('Entertainment',   'expense', 'tv',                 '#8b5cf6', true),
  ('Shopping',        'expense', 'shopping-bag',       '#ec4899', true),
  ('Education',       'expense', 'graduation-cap',     '#14b8a6', true),
  ('Utilities',       'expense', 'zap',                '#f97316', true),
  ('Subscriptions',   'expense', 'repeat',             '#a855f7', true),
  ('Personal Care',   'expense', 'sparkles',           '#06b6d4', true),
  ('Other Expenses',  'expense', 'circle-ellipsis',    '#6b7280', true)
ON CONFLICT (name) DO NOTHING;

-- Income Categories
INSERT INTO categories (name, type, icon, color, is_builtin) VALUES
  ('Salary',          'income', 'briefcase',           '#22c55e', true),
  ('Freelance',       'income', 'laptop',              '#84cc16', true),
  ('Investment',      'income', 'trending-up',         '#10b981', true),
  ('Bonus',           'income', 'gift',                '#f472b6', true),
  ('Gift',            'income', 'gift-box',            '#fbbf24', true),
  ('Other Income',    'income', 'plus-circle',         '#6b7280', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 9. Insert Sample Data (optional, remove if not needed)
-- ============================================================================

-- Sample Account
INSERT INTO accounts (name, type, balance, currency) VALUES
  ('Main Bank Account', 'bank', 5000.00, 'CHF')
ON CONFLICT DO NOTHING;

-- Sample Transaction (optional)
-- INSERT INTO transactions (account_id, category_id, amount, type, description, date)
-- SELECT 
--   (SELECT id FROM accounts LIMIT 1),
--   (SELECT id FROM categories WHERE name = 'Salary' LIMIT 1),
--   3500.00,
--   'income',
--   'Monthly Salary',
--   CURRENT_DATE
-- WHERE NOT EXISTS (SELECT 1 FROM transactions);

-- ============================================================================
-- End of Schema
-- ============================================================================