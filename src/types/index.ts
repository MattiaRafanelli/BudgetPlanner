export type TransactionType = 'income' | 'expense' | 'transfer';

export type AccountType = 'cash' | 'bank' | 'savings' | 'wallet' | 'credit';

export type RecurrenceInterval = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TransactionCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'education'
  | 'utilities'
  | 'subscriptions'
  | 'personal'
  | 'other_expense'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'gift'
  | 'other_income';

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
  category: TransactionCategory;
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
  category: TransactionCategory;
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
  category: TransactionCategory;
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
  activePeriod: BudgetPeriod;
  selectedAccountId: string | null;
  ui: {
    sidebarCollapsed: boolean;
    theme: 'dark';
  };
}
