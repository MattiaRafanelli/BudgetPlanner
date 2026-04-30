import React from 'react';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Account } from '@/types';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_ICONS } from '@/constants';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { DynamicIcon } from '@/components/DynamicIcon';

interface AccountCardProps {
  account: Account;
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  onEdit: (a: Account) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function AccountCard({
  account,
  balance,
  monthlyIncome,
  monthlyExpenses,
  onEdit,
  onDelete,
  onClick,
}: AccountCardProps) {
  const icon = ACCOUNT_TYPE_ICONS[account.type];

  return (
    <div
      className="bg-surface border border-border rounded-2xl p-5 hover:border-accent-primary/30 hover:bg-elevated transition-all duration-200 cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(account);
          }}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(account.id);
          }}
          className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${account.color}20` }}
        >
          <DynamicIcon name={icon} size={20} style={{ color: account.color }} />
        </div>
        <div>
          <p className="font-semibold text-text-primary text-sm">{account.name}</p>
          <Badge color={account.color}>{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-xs text-text-muted mb-0.5">Current Balance</p>
        <p
          className={`text-2xl font-bold tabular-nums ${
            balance >= 0 ? 'text-text-primary' : 'text-accent-red'
          }`}
        >
          {formatCurrency(balance, account.currency)}
        </p>
      </div>

      {/* This month stats */}
      <div className="flex items-center gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-accent-green/10 flex items-center justify-center">
            <ArrowUpRight size={12} className="text-accent-green" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Income</p>
            <p className="text-xs font-semibold tabular-nums text-accent-green">
              {formatCurrency(monthlyIncome, account.currency, true)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-accent-red/10 flex items-center justify-center">
            <ArrowDownRight size={12} className="text-accent-red" />
          </div>
          <div>
            <p className="text-[10px] text-text-muted">Expenses</p>
            <p className="text-xs font-semibold tabular-nums text-accent-red">
              {formatCurrency(monthlyExpenses, account.currency, true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
