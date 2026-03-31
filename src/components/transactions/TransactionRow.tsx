import React from 'react';
import { Pencil, Trash2, ArrowLeftRight } from 'lucide-react';
import type { Transaction, Account } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '@/constants';
import { formatCurrency, formatRelativeDate } from '@/utils/formatters';
import { DynamicIcon } from '@/components/DynamicIcon';
import { Badge } from '@/components/ui/Badge';

interface TransactionRowProps {
  transaction: Transaction;
  account: Account | undefined;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionRow({
  transaction,
  account,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const color = isTransfer ? '#6C63FF' : CATEGORY_COLORS[transaction.category];
  const icon = CATEGORY_ICONS[transaction.category];

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-elevated rounded-xl transition-colors group">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        {isTransfer
          ? <ArrowLeftRight size={18} style={{ color }} />
          : <DynamicIcon name={icon} size={18} style={{ color }} />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-text-primary truncate">
            {transaction.description || (isTransfer ? 'Transfer' : CATEGORY_LABELS[transaction.category])}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">
            {formatRelativeDate(transaction.date)}
          </span>
          {account && (
            <>
              <span className="text-text-muted text-xs">·</span>
              <span className="flex items-center gap-1 text-xs text-text-muted">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
                {account.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className={`text-sm font-semibold tabular-nums ${
            isIncome
              ? 'text-accent-green'
              : isTransfer
              ? 'text-text-secondary'
              : 'text-accent-red'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatCurrency(transaction.amount, account?.currency ?? 'EUR')}
        </p>
        {!isTransfer && (
          <p className="text-xs text-text-muted">{CATEGORY_LABELS[transaction.category]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
