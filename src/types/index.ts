export type TransactionType = 'income' | 'expense' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'savings' | 'wallet' | 'credit';

export type RecurrenceInterval = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// Built-in category IDs (kept for backward-compat with stored data)
export type BuiltInCategory =
  | 'housing' | 'food' | 'transport' | 'healthcare'
  | 'entertainment' | 'shopping' | 'education'
  | 'utilities' | 'subscriptions' | 'personal' | 'other_expense'
  | 'salary' | 'freelance' | 'investment' | 'gift' | 'other_income';

// All category IDs are strings (built-in or custom)
export type TransactionCategory = string;

export interface Category {
  id: string;
  name: string;
  icon: string;        // Lucide icon name
  color: string;       // hex
  type: 'income' | 'expense';
  parentId: string | null;  // null = top-level, string = subcategory of that id
  isBuiltIn: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  toAccountId?: string;
  type: TransactionType;
  category: string;   // category id (built-in or custom)
  amount: number;
  description: string;
  date: string;
  recurrence: RecurrenceInterval;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetLimit {
  id: string;
  category: string;   // category id (built-in or custom)
  monthlyLimit: number;
}

export interface BudgetPeriod {
  month: number;
  year: number;
}

export interface AccountBalance {
  accountId: string;
  computed: number;
}

export interface CategorySpend {
  category: string;
  spent: number;
  limit: number | null;
  percentage: number | null;
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  budgetLimits: BudgetLimit[];
  customCategories: Category[];
  activePeriod: BudgetPeriod;
  selectedAccountId: string | null;
  ui: {
    sidebarCollapsed: boolean;
    theme: 'dark';
  };
}
