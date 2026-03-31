import type { TransactionCategory, AccountType } from '@/types';

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  housing: 'Housing',
  food: 'Food & Dining',
  transport: 'Transport',
  healthcare: 'Healthcare',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  education: 'Education',
  utilities: 'Utilities',
  subscriptions: 'Subscriptions',
  personal: 'Personal Care',
  other_expense: 'Other',
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  gift: 'Gift',
  other_income: 'Other Income',
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  housing: 'Home',
  food: 'UtensilsCrossed',
  transport: 'Car',
  healthcare: 'Heart',
  entertainment: 'Tv',
  shopping: 'ShoppingBag',
  education: 'GraduationCap',
  utilities: 'Zap',
  subscriptions: 'RefreshCw',
  personal: 'Sparkles',
  other_expense: 'MoreHorizontal',
  salary: 'Briefcase',
  freelance: 'Laptop',
  investment: 'TrendingUp',
  gift: 'Gift',
  other_income: 'DollarSign',
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  housing: '#6C63FF',
  food: '#F97316',
  transport: '#3B82F6',
  healthcare: '#EF4444',
  entertainment: '#EC4899',
  shopping: '#A855F7',
  education: '#14B8A6',
  utilities: '#F59E0B',
  subscriptions: '#22C55E',
  personal: '#F472B6',
  other_expense: '#94A3B8',
  salary: '#22C55E',
  freelance: '#14B8A6',
  investment: '#6C63FF',
  gift: '#EC4899',
  other_income: '#94A3B8',
};

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'housing',
  'food',
  'transport',
  'healthcare',
  'entertainment',
  'shopping',
  'education',
  'utilities',
  'subscriptions',
  'personal',
  'other_expense',
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'salary',
  'freelance',
  'investment',
  'gift',
  'other_income',
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  cash: 'Cash',
  bank: 'Bank Account',
  savings: 'Savings',
  wallet: 'Digital Wallet',
  credit: 'Credit Card',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  cash: 'Banknote',
  bank: 'Building2',
  savings: 'PiggyBank',
  wallet: 'Smartphone',
  credit: 'CreditCard',
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  cash: '#F97316',
  bank: '#3B82F6',
  savings: '#14B8A6',
  wallet: '#EC4899',
  credit: '#A855F7',
};

export const ACCOUNT_COLOR_PRESETS = [
  '#6C63FF',
  '#3B82F6',
  '#22C55E',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#14B8A6',
  '#A855F7',
  '#F59E0B',
  '#F472B6',
];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
