import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Transaction, Account } from '@/types';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Card } from '@/components/ui/Card';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
}

export function RecentTransactions({
  transactions,
  accounts,
  onEdit,
  onDelete,
  onViewAll,
}: RecentTransactionsProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Recent Transactions
        </h3>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs text-accent-primary hover:text-[#5a52e0] transition-colors font-medium"
        >
          View all <ArrowRight size={13} />
        </button>
      </div>
      <TransactionList
        transactions={transactions}
        accounts={accounts}
        onEdit={onEdit}
        onDelete={onDelete}
        limit={5}
      />
    </Card>
  );
}
