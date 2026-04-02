import { Pencil, Trash2, Plus } from 'lucide-react';
import type { CategorySpend } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useCategories } from '@/hooks/useCategories';

interface CategoryBudgetRowProps {
  item: CategorySpend;
  currency?: string;
  onSetLimit: (category: string) => void;
  onRemoveLimit: (category: string) => void;
}

function getBarColor(pct: number): string {
  if (pct >= 90) return 'bg-accent-red';
  if (pct >= 70) return 'bg-accent-amber';
  return 'bg-accent-green';
}

export function CategoryBudgetRow({ item, currency = 'EUR', onSetLimit, onRemoveLimit }: CategoryBudgetRowProps) {
  const { getCategoryName, getCategoryIcon, getCategoryColor } = useCategories();

  const color    = getCategoryColor(item.category);
  const icon     = getCategoryIcon(item.category);
  const name     = getCategoryName(item.category);
  const pct      = item.percentage ?? 0;
  const barColor = item.percentage !== null ? getBarColor(pct) : 'bg-accent-primary';

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-elevated rounded-xl transition-colors group">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <DynamicIcon name={icon} size={16} style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-text-primary">{name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-text-primary font-semibold">
              {formatCurrency(item.spent, currency, true)}
            </span>
            {item.limit !== null && (
              <span className="text-xs tabular-nums text-text-muted">
                / {formatCurrency(item.limit, currency, true)}
              </span>
            )}
            {item.percentage !== null && (
              <span className={`text-xs tabular-nums font-medium ${
                pct >= 90 ? 'text-accent-red' : pct >= 70 ? 'text-accent-amber' : 'text-accent-green'
              }`}>
                {formatPercentage(pct)}
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onSetLimit(item.category)}
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-border rounded-lg transition-colors"
          title={item.limit !== null ? 'Edit limit' : 'Set limit'}
        >
          {item.limit !== null ? <Pencil size={13} /> : <Plus size={13} />}
        </button>
        {item.limit !== null && (
          <button
            onClick={() => onRemoveLimit(item.category)}
            className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
            title="Remove limit"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
