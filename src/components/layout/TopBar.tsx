import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';
import { Button } from '@/components/ui/Button';
import { MONTHS } from '@/constants';

interface TopBarProps {
  title: string;
  onAddTransaction?: () => void;
}

export function TopBar({ title, onAddTransaction }: TopBarProps) {
  const { state, dispatch } = useBudget();
  const { month, year } = state.activePeriod;

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    dispatch({ type: 'SET_PERIOD', payload: { month: d.getMonth() + 1, year: d.getFullYear() } });
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    dispatch({ type: 'SET_PERIOD', payload: { month: d.getMonth() + 1, year: d.getFullYear() } });
  };

  const isCurrentMonth =
    month === new Date().getMonth() + 1 && year === new Date().getFullYear();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-surface/50 backdrop-blur-sm gap-3">
      {/* Title */}
      <h1 className="text-base md:text-lg font-bold text-text-primary truncate">{title}</h1>

      <div className="flex items-center gap-2 shrink-0">
        {/* Period selector */}
        <div className="flex items-center gap-0.5 bg-elevated border border-border rounded-xl px-1 py-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() =>
              dispatch({
                type: 'SET_PERIOD',
                payload: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
              })
            }
            className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-lg transition-colors min-w-[80px] md:min-w-[120px] text-center ${
              isCurrentMonth ? 'text-accent-primary' : 'text-text-primary hover:text-accent-primary'
            }`}
          >
            {/* Short on mobile, full on desktop */}
            <span className="md:hidden">{MONTHS[month - 1].slice(0, 3)} {String(year).slice(2)}</span>
            <span className="hidden md:inline">{MONTHS[month - 1]} {year}</span>
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Add Transaction — icon only on mobile, full button on desktop */}
        {onAddTransaction && (
          <>
            {/* Mobile: icon-only round button */}
            <button
              onClick={onAddTransaction}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-accent-primary hover:bg-[#5a52e0] rounded-xl text-white transition-colors"
            >
              <Plus size={18} />
            </button>
            {/* Desktop: full button */}
            <div className="hidden md:block">
              <Button onClick={onAddTransaction} icon={<Plus size={16} />}>
                Add Transaction
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
