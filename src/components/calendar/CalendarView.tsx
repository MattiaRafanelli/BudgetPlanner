import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  income: number;
  expenses: number;
  isPayday: boolean;
}

interface CalendarViewProps {
  transactions: any[];
  currency?: string;
  onSelectDay?: (date: Date) => void;
}

const BudgetCalendar: React.FC<CalendarViewProps> = ({
  transactions,
  currency = 'CHF',
  onSelectDay,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate payday (1st of month, adjusted for weekends)
  const calculatePayday = (date: Date): number => {
    const payday = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = payday.getDay();
    if (dayOfWeek === 6) payday.setDate(payday.getDate() - 1); // Saturday → Friday
    if (dayOfWeek === 0) payday.setDate(payday.getDate() - 2); // Sunday → Friday
    return payday.getDate();
  };

  const paydayDate = calculatePayday(currentDate);

  // Get all days for the calendar
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month's days
    const startingDayOfWeek = firstDay.getDay();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() - 1, prevMonthLastDay - i),
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        income: 0,
        expenses: 0,
        isPayday: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i);
      const dayString = dayDate.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(
        (tx) => tx.date.split('T')[0] === dayString
      );

      const income = dayTransactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenses = dayTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      days.push({
        date: dayDate,
        day: i,
        isCurrentMonth: true,
        income,
        expenses,
        isPayday: i === paydayDate,
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() + 1, i),
        day: i,
        isCurrentMonth: false,
        income: 0,
        expenses: 0,
        isPayday: false,
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === currentDate.getMonth() && 
    today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated/50">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            {monthName} {year}
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            💰 Payday: {paydayDate}{paydayDate === 1 ? 'st' : paydayDate === 21 || paydayDate === 31 ? 'st' : 'nd'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-border rounded-lg transition-colors text-text-muted hover:text-text-primary"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-border rounded-lg transition-colors text-text-muted hover:text-text-primary"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 border-b border-border bg-elevated/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="h-12 flex items-center justify-center text-xs font-semibold text-text-muted uppercase tracking-wide border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="divide-y divide-border">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
            {week.map((dayObj, dayIndex) => {
              const isToday =
                isCurrentMonth &&
                dayObj.day === today.getDate() &&
                dayObj.isCurrentMonth;
              const net = dayObj.income - dayObj.expenses;

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={() => onSelectDay && onSelectDay(dayObj.date)}
                  className={`
                    min-h-28 p-3 transition-all cursor-pointer group
                    ${dayObj.isCurrentMonth ? 'hover:bg-elevated' : 'bg-surface/50'}
                    ${isToday ? 'bg-accent-primary/10' : ''}
                    ${dayObj.isPayday && dayObj.isCurrentMonth ? 'bg-accent-green/5 border-2 border-accent-green/30' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`
                        text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg
                        ${!dayObj.isCurrentMonth ? 'text-text-muted' : 'text-text-primary'}
                        ${isToday ? 'bg-accent-primary text-white' : ''}
                        ${dayObj.isPayday && dayObj.isCurrentMonth ? 'bg-accent-green/20 text-accent-green' : ''}
                      `}
                    >
                      {dayObj.day}
                    </span>
                    {dayObj.isPayday && dayObj.isCurrentMonth && (
                      <span className="text-xs px-1.5 py-0.5 bg-accent-green/20 text-accent-green rounded font-medium">
                        💰
                      </span>
                    )}
                  </div>

                  {dayObj.isCurrentMonth && (
                    <div className="space-y-1.5">
                      {dayObj.income > 0 && (
                        <div className="flex items-center gap-1 text-[11px] group/income">
                          <TrendingUp size={12} className="text-accent-green shrink-0" />
                          <span className="text-accent-green font-medium truncate">
                            +{formatCurrency(dayObj.income, currency, true)}
                          </span>
                        </div>
                      )}

                      {dayObj.expenses > 0 && (
                        <div className="flex items-center gap-1 text-[11px] group/expense">
                          <TrendingDown size={12} className="text-accent-red shrink-0" />
                          <span className="text-accent-red font-medium truncate">
                            -{formatCurrency(dayObj.expenses, currency, true)}
                          </span>
                        </div>
                      )}

                      {(dayObj.income > 0 || dayObj.expenses > 0) && (
                        <div className={`pt-1 border-t border-border/30 text-[10px] font-semibold tabular-nums ${
                          net >= 0 ? 'text-accent-green' : 'text-accent-red'
                        }`}>
                          {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net), currency, true)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-border bg-elevated/30 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-green/30"></div>
          <span className="text-text-muted">Payday</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-green" />
          <span className="text-text-muted">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-accent-red" />
          <span className="text-text-muted">Expenses</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalendar;
