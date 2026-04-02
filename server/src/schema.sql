-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM types
CREATE TYPE category_type AS ENUM ('expense', 'income');
CREATE TYPE transaction_type AS ENUM ('expense', 'income');
CREATE TYPE budget_period AS ENUM ('monthly', 'weekly', 'yearly');

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  type       category_type NOT NULL,
  icon       VARCHAR(50),
  color      VARCHAR(20),
  is_builtin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- accounts
CREATE TABLE IF NOT EXISTS accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  type       VARCHAR(20) CHECK (type IN ('bank', 'cash', 'credit_card', 'savings')),
  balance    DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency   VARCHAR(10) NOT NULL DEFAULT 'CHF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- transactions
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount      DECIMAL(15,2) NOT NULL,
  type        transaction_type NOT NULL,
  description VARCHAR(255),
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- budgets
CREATE TABLE IF NOT EXISTS budgets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount      DECIMAL(15,2) NOT NULL,
  period      budget_period NOT NULL DEFAULT 'monthly',
  start_date  DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Built-in expense categories
INSERT INTO categories (name, type, icon, color, is_builtin) VALUES
  ('Housing',       'expense', 'home',          '#6366f1', true),
  ('Food & Dining', 'expense', 'utensils',      '#f59e0b', true),
  ('Transport',     'expense', 'car',           '#3b82f6', true),
  ('Healthcare',    'expense', 'heart-pulse',   '#ef4444', true),
  ('Entertainment', 'expense', 'tv',            '#8b5cf6', true),
  ('Shopping',      'expense', 'shopping-bag',  '#ec4899', true),
  ('Education',     'expense', 'graduation-cap','#14b8a6', true),
  ('Utilities',     'expense', 'zap',           '#f97316', true),
  ('Subscriptions', 'expense', 'repeat',        '#a855f7', true),
  ('Personal Care', 'expense', 'sparkles',      '#06b6d4', true),
  ('Other',         'expense', 'circle-ellipsis','#6b7280',true)
ON CONFLICT DO NOTHING;

-- Built-in income categories
INSERT INTO categories (name, type, icon, color, is_builtin) VALUES
  ('Salary',        'income', 'briefcase',  '#22c55e', true),
  ('Freelance',     'income', 'laptop',     '#84cc16', true),
  ('Investment',    'income', 'trending-up','#10b981', true),
  ('Gift',          'income', 'gift',       '#f472b6', true),
  ('Other Income',  'income', 'plus-circle','#6b7280', true)
ON CONFLICT DO NOTHING;
