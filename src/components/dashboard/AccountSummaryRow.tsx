import React from 'react';
import type { Account } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { DynamicIcon } from '@/components/DynamicIcon';
import { ACCOUNT_TYPE_ICONS } from '@/constants';
import { computeAccountBalance } from '@/utils/calculations';
import { useBudget } from '@/hooks/useBudget';

interface AccountSummaryRowProps {
  onSelectAccount: (id: string) => void;
  onNavigateAccounts: () => void;
}

export function AccountSummaryRow({
  onSelectAccount,
  onNavigateAccounts,
}: AccountSummaryRowProps) {
  const { state } = useBudget();
  const { accounts, transactions } = state;
  const active = accounts.filter((a) => !a.isArchived);

  if (active.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {active.slice(0, 5).map((account) => {
        const balance = computeAccountBalance(account, transactions);
        const icon = ACCOUNT_TYPE_ICONS[account.type];
        return (
          <button
            key={account.id}
            onClick={() => {
              onSelectAccount(account.id);
              onNavigateAccounts();
            }}
            className="flex items-center gap-2.5 px-3 py-2 bg-elevated border border-border rounded-xl hover:border-accent-primary/40 transition-all shrink-0 text-left"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${account.color}20` }}
            >
              <DynamicIcon name={icon} size={14} style={{ color: account.color }} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-primary leading-tight">{account.name}</p>
              <p
                className={`text-xs tabular-nums font-semibold leading-tight ${
                  balance >= 0 ? 'text-text-secondary' : 'text-accent-red'
                }`}
              >
                {formatCurrency(balance, account.currency, true)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
