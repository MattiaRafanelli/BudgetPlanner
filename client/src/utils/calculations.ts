import type {
  Account,
  Transaction,
  BudgetLimit,
  CategorySpend,
  MonthlySummary,
  TransactionCategory,
} from '@/types';
import { EXPENSE_CATEGORIES } from '@/constants';

export function computeAccountBalance(
  account: Account,
  transactions: Transaction[]
): number {
  const accountTxs = transactions.filter(
    (t) => t.accountId === account.id || t.toAccountId === account.id
  );

  const delta = accountTxs.reduce((sum, t) => {
    if (t.type === 'transfer') {
      if (t.accountId === account.id) return sum - t.amount;
      if (t.toAccountId === account.id) return sum + t.amount;
    }
    if (t.accountId !== account.id) return sum;
    if (t.type === 'income') return sum + t.amount;
    if (t.type === 'expense') return sum - t.amount;
    return sum;
  }, 0);

  return account.initialBalance + delta;
}

export function getTotalBalance(
  accounts: Account[],
  transactions: Transaction[]
): number {
  return accounts
    .filter((a) => !a.isArchived)
    .reduce((sum, a) => sum + computeAccountBalance(a, transactions), 0);
}

export function getMonthTransactions(
  transactions: Transaction[],
  month: number,
  year: number,
  accountId: string | null = null
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    const matchesPeriod = d.getMonth() + 1 === month && d.getFullYear() === year;
    const matchesAccount =
      accountId === null || t.accountId === accountId || t.toAccountId === accountId;
    return matchesPeriod && matchesAccount;
  });
}

export function getMonthlyIncome(
  transactions: Transaction[],
  month: number,
  year: number,
  accountId: string | null = null
): number {
  return getMonthTransactions(transactions, month, year, accountId)
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyExpenses(
  transactions: Transaction[],
  month: number,
  year: number,
  accountId: string | null = null
): number {
  return getMonthTransactions(transactions, month, year, accountId)
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategorySpend(
  transactions: Transaction[],
  limits: BudgetLimit[],
  month: number,
  year: number,
  accountId: string | null = null
): CategorySpend[] {
  const monthTxs = getMonthTransactions(transactions, month, year, accountId).filter(
    (t) => t.type === 'expense'
  );

  const spendMap: Partial<Record<TransactionCategory, number>> = {};
  for (const t of monthTxs) {
    spendMap[t.category] = (spendMap[t.category] ?? 0) + t.amount;
  }

  const allCategories = new Set<TransactionCategory>([
    ...EXPENSE_CATEGORIES,
    ...Object.keys(spendMap) as TransactionCategory[],
  ]);

  return Array.from(allCategories)
    .map((category) => {
      const spent = spendMap[category] ?? 0;
      const limitObj = limits.find((l) => l.category === category);
      const limit = limitObj?.monthlyLimit ?? null;
      const percentage = limit !== null && limit > 0 ? (spent / limit) * 100 : null;
      return { category, spent, limit, percentage };
    })
    .filter((c) => c.spent > 0 || c.limit !== null)
    .sort((a, b) => b.spent - a.spent);
}

export function buildMonthlySummaries(
  transactions: Transaction[],
  monthCount = 12
): MonthlySummary[] {
  const now = new Date();
  const results: MonthlySummary[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const monthTxs = getMonthTransactions(transactions, month, year);
    const totalIncome = monthTxs
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = monthTxs
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    results.push({ year, month, totalIncome, totalExpenses, net: totalIncome - totalExpenses });
  }

  return results;
}

export function getBudgetPercentage(
  transactions: Transaction[],
  limits: BudgetLimit[],
  month: number,
  year: number
): number {
  const totalExpenses = getMonthlyExpenses(transactions, month, year);
  const totalLimit = limits.reduce((s, l) => s + l.monthlyLimit, 0);
  if (totalLimit === 0) return 0;
  return (totalExpenses / totalLimit) * 100;
}
