import { useMemo } from 'react';
import { useBudget } from './useBudget';
import { BUILT_IN_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, CATEGORY_LABELS } from '@/constants';
import type { Category } from '@/types';

const FALLBACK: Category = {
  id: 'unknown',
  name: 'Unknown',
  icon: 'HelpCircle',
  color: '#94A3B8',
  type: 'expense',
  parentId: null,
  isBuiltIn: false,
};

export function useCategories() {
  const { state } = useBudget();
  const { customCategories } = state;

  const allCategories = useMemo<Category[]>(
    () => [...BUILT_IN_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const expenseCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'expense'),
    [allCategories]
  );

  const incomeCategories = useMemo(
    () => allCategories.filter((c) => c.type === 'income'),
    [allCategories]
  );

  // Top-level only (no subcategories)
  const topLevelExpense = useMemo(
    () => expenseCategories.filter((c) => c.parentId === null),
    [expenseCategories]
  );

  const topLevelIncome = useMemo(
    () => incomeCategories.filter((c) => c.parentId === null),
    [incomeCategories]
  );

  function getCategoryById(id: string): Category {
    return allCategories.find((c) => c.id === id) ?? FALLBACK;
  }

  function getCategoryName(id: string): string {
    // Built-in label map first (faster)
    if (CATEGORY_LABELS[id]) return CATEGORY_LABELS[id];
    return allCategories.find((c) => c.id === id)?.name ?? id;
  }

  function getCategoryIcon(id: string): string {
    if (CATEGORY_ICONS[id]) return CATEGORY_ICONS[id];
    return allCategories.find((c) => c.id === id)?.icon ?? 'Tag';
  }

  function getCategoryColor(id: string): string {
    if (CATEGORY_COLORS[id]) return CATEGORY_COLORS[id];
    return allCategories.find((c) => c.id === id)?.color ?? '#94A3B8';
  }

  /** Returns parent then its children, for use in grouped selects */
  function getGroupedExpenseOptions(): { parent: Category; children: Category[] }[] {
    return topLevelExpense.map((parent) => ({
      parent,
      children: expenseCategories.filter((c) => c.parentId === parent.id),
    }));
  }

  function getGroupedIncomeOptions(): { parent: Category; children: Category[] }[] {
    return topLevelIncome.map((parent) => ({
      parent,
      children: incomeCategories.filter((c) => c.parentId === parent.id),
    }));
  }

  return {
    allCategories,
    expenseCategories,
    incomeCategories,
    topLevelExpense,
    topLevelIncome,
    customCategories,
    getCategoryById,
    getCategoryName,
    getCategoryIcon,
    getCategoryColor,
    getGroupedExpenseOptions,
    getGroupedIncomeOptions,
  };
}
