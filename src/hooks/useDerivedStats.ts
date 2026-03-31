import { useMemo } from 'react';
import { useBudget } from './useBudget';
import {
  computeAccountBalance,
  getTotalBalance,
  getMonthlyIncome,
  getMonthlyExpenses,
  getCategorySpend,
  buildMonthlySummaries,
  getBudgetPercentage,
} from '@/utils/calculations';

export function useDerivedStats() {
  const { state } = useBudget();
  const { accounts, transactions, budgetLimits, activePeriod, selectedAccountId } = state;
  const { month, year } = activePeriod;

  const accountBalances = useMemo(
    () =>
      accounts.map((a) => ({
        accountId: a.id,
        computed: computeAccountBalance(a, transactions),
      })),
    [accounts, transactions]
  );

  const totalBalance = useMemo(
    () => getTotalBalance(accounts, transactions),
    [accounts, transactions]
  );

  const monthlyIncome = useMemo(
    () => getMonthlyIncome(transactions, month, year, selectedAccountId),
    [transactions, month, year, selectedAccountId]
  );

  const monthlyExpenses = useMemo(
    () => getMonthlyExpenses(transactions, month, year, selectedAccountId),
    [transactions, month, year, selectedAccountId]
  );

  const monthlyNet = monthlyIncome - monthlyExpenses;

  const categorySpend = useMemo(
    () => getCategorySpend(transactions, budgetLimits, month, year, selectedAccountId),
    [transactions, budgetLimits, month, year, selectedAccountId]
  );

  const monthlySummaries = useMemo(
    () => buildMonthlySummaries(transactions, 12),
    [transactions]
  );

  const budgetPercentage = useMemo(
    () => getBudgetPercentage(transactions, budgetLimits, month, year),
    [transactions, budgetLimits, month, year]
  );

  const totalBudget = useMemo(
    () => budgetLimits.reduce((s, l) => s + l.monthlyLimit, 0),
    [budgetLimits]
  );

  return {
    accountBalances,
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlyNet,
    categorySpend,
    monthlySummaries,
    budgetPercentage,
    totalBudget,
  };
}
