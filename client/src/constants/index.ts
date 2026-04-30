import type { Category } from '@/types';

// ── Label / icon / color maps for built-in categories ───────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
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

export const CATEGORY_ICONS: Record<string, string> = {
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

export const CATEGORY_COLORS: Record<string, string> = {
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

// ── Built-in categories as Category objects ──────────────────────────────────

export const BUILT_IN_CATEGORIES: Category[] = [
  // Expense
  { id: 'housing',       name: 'Housing',        icon: 'Home',           color: '#6C63FF', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'food',          name: 'Food & Dining',   icon: 'UtensilsCrossed',color: '#F97316', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'transport',     name: 'Transport',       icon: 'Car',            color: '#3B82F6', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'healthcare',    name: 'Healthcare',      icon: 'Heart',          color: '#EF4444', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'entertainment', name: 'Entertainment',   icon: 'Tv',             color: '#EC4899', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'shopping',      name: 'Shopping',        icon: 'ShoppingBag',    color: '#A855F7', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'education',     name: 'Education',       icon: 'GraduationCap',  color: '#14B8A6', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'utilities',     name: 'Utilities',       icon: 'Zap',            color: '#F59E0B', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'subscriptions', name: 'Subscriptions',   icon: 'RefreshCw',      color: '#22C55E', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'personal',      name: 'Personal Care',   icon: 'Sparkles',       color: '#F472B6', type: 'expense', parentId: null, isBuiltIn: true },
  { id: 'other_expense', name: 'Other',           icon: 'MoreHorizontal', color: '#94A3B8', type: 'expense', parentId: null, isBuiltIn: true },
  // Income
  { id: 'salary',        name: 'Salary',          icon: 'Briefcase',      color: '#22C55E', type: 'income',  parentId: null, isBuiltIn: true },
  { id: 'freelance',     name: 'Freelance',       icon: 'Laptop',         color: '#14B8A6', type: 'income',  parentId: null, isBuiltIn: true },
  { id: 'investment',    name: 'Investment',      icon: 'TrendingUp',     color: '#6C63FF', type: 'income',  parentId: null, isBuiltIn: true },
  { id: 'gift',          name: 'Gift',            icon: 'Gift',           color: '#EC4899', type: 'income',  parentId: null, isBuiltIn: true },
  { id: 'other_income',  name: 'Other Income',    icon: 'DollarSign',     color: '#94A3B8', type: 'income',  parentId: null, isBuiltIn: true },
];

export const EXPENSE_CATEGORIES = BUILT_IN_CATEGORIES
  .filter((c) => c.type === 'expense' && c.parentId === null)
  .map((c) => c.id);

export const INCOME_CATEGORIES = BUILT_IN_CATEGORIES
  .filter((c) => c.type === 'income' && c.parentId === null)
  .map((c) => c.id);

// ── Account constants ────────────────────────────────────────────────────────

import type { AccountType } from '@/types';

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
  '#6C63FF', '#3B82F6', '#22C55E', '#F97316', '#EF4444',
  '#EC4899', '#14B8A6', '#A855F7', '#F59E0B', '#F472B6',
];

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const MONTH_SHORT = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

// ── Lucide icon options for the category picker ──────────────────────────────

export const ICON_OPTIONS = [
  'Home','UtensilsCrossed','Car','Heart','Tv','ShoppingBag','GraduationCap',
  'Zap','RefreshCw','Sparkles','MoreHorizontal','Briefcase','Laptop',
  'TrendingUp','Gift','DollarSign','Plane','Music','Camera','Coffee',
  'Dumbbell','Gamepad2','Baby','Dog','Flower2','Fuel','ParkingCircle',
  'Pill','ShoppingCart','Smartphone','Train','Wrench','Package',
  'Building2','Banknote','PiggyBank','CreditCard','Wallet',
  'Star','Flag','Globe','BookOpen','Headphones','Monitor',
];

export const COLOR_PRESETS = [
  '#6C63FF','#3B82F6','#22C55E','#F97316','#EF4444',
  '#EC4899','#14B8A6','#A855F7','#F59E0B','#F472B6',
  '#06B6D4','#84CC16','#F43F5E','#8B5CF6','#10B981',
];
