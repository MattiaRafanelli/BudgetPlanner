import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { Transaction, Account } from '@/types';
import { TransactionRow } from './TransactionRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateShort } from '@/utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  limit?: number;
}

function groupByDate(transactions: Transaction[]): [string, Transaction[]][] {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactions) {
    const key = t.date.slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export function TransactionList({
  transactions,
  accounts,
  onEdit,
  onDelete,
  limit,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ArrowLeftRight size={24} />}
        title="No transactions yet"
        description="Add your first transaction to start tracking your finances."
      />
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const displayed = limit ? sorted.slice(0, limit) : sorted;
  const groups = groupByDate(displayed);

  return (
    <div className="space-y-4">
      {groups.map(([date, txs]) => (
        <div key={date}>
          <div className="px-4 py-1.5">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {formatDateShort(date)}
            </span>
          </div>
          <div className="space-y-0.5">
            {txs.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                account={accounts.find((a) => a.id === t.accountId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
