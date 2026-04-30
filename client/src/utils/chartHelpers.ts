import type { MonthlySummary, CategorySpend } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS, MONTH_SHORT } from '@/constants';

export interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface DonutDataPoint {
  name: string;
  value: number;
  color: string;
  category: string;
}

export interface BalanceTrendPoint {
  month: string;
  balance: number;
}

export function toCashFlowBarData(summaries: MonthlySummary[]): CashFlowDataPoint[] {
  return summaries.map((s) => ({
    month: `${MONTH_SHORT[s.month - 1]} ${String(s.year).slice(2)}`,
    income: s.totalIncome,
    expenses: s.totalExpenses,
    net: s.net,
  }));
}

export function toDonutData(categorySpend: CategorySpend[]): DonutDataPoint[] {
  return categorySpend
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8)
    .map((c) => ({
      name: CATEGORY_LABELS[c.category],
      value: c.spent,
      color: CATEGORY_COLORS[c.category],
      category: c.category,
    }));
}

export function toBalanceTrendData(summaries: MonthlySummary[]): BalanceTrendPoint[] {
  let running = 0;
  return summaries.map((s) => {
    running += s.net;
    return {
      month: `${MONTH_SHORT[s.month - 1]} ${String(s.year).slice(2)}`,
      balance: running,
    };
  });
}
