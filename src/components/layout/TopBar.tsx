import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';
import { Button } from '@/components/ui/Button';
import { formatMonthYear } from '@/utils/formatters';
import { MONTHS } from '@/constants';

// MONTHS used for period display button

interface TopBarProps {
  title: string;
  onAddTransaction?: () => void;
}

export function TopBar({ title, onAddTransaction }: TopBarProps) {
  const { state, dispatch } = useBudget();
  const { month, year } = state.activePeriod;

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    dispatch({
      type: 'SET_PERIOD',
      payload: { month: d.getMonth() + 1, year: d.getFullYear() },
    });
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    dispatch({
      type: 'SET_PERIOD',
      payload: { month: d.getMonth() + 1, year: d.getFullYear() },
    });
  };

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-bold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Period selector */}
        <div className="flex items-center gap-1 bg-elevated border border-border rounded-xl px-1 py-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: 'SET_PERIOD',
                payload: {
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear(),
                },
              })
            }
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors min-w-[120px] ${
              isCurrentMonth
                ? 'text-accent-primary'
                : 'text-text-primary hover:text-accent-primary'
            }`}
          >
            {MONTHS[month - 1]} {year}
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {onAddTransaction && (
          <Button
            onClick={onAddTransaction}
            icon={<Plus size={16} />}
            size="md"
          >
            Add Transaction
          </Button>
        )}
      </div>
    </header>
  );
}
