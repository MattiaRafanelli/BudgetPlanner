import React from 'react';
import { Plus, Wallet } from 'lucide-react';
import type { Account } from '@/types';
import { AccountCard } from './AccountCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { computeAccountBalance, getMonthlyIncome, getMonthlyExpenses } from '@/utils/calculations';
import { useBudget } from '@/hooks/useBudget';

interface AccountListProps {
  accounts: Account[];
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect: (id: string) => void;
}

export function AccountList({
  accounts,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
}: AccountListProps) {
  const { state } = useBudget();
  const { transactions, activePeriod } = state;
  const { month, year } = activePeriod;

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Wallet size={24} />}
        title="No accounts yet"
        description="Add a bank account, cash wallet, or savings account to get started."
        action={
          <Button onClick={onAdd} icon={<Plus size={16} />}>
            Add Account
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          balance={computeAccountBalance(account, transactions)}
          monthlyIncome={getMonthlyIncome(transactions, month, year, account.id)}
          monthlyExpenses={getMonthlyExpenses(transactions, month, year, account.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={() => onSelect(account.id)}
        />
      ))}
    </div>
  );
}
