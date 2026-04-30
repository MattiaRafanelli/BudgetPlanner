import React, { useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { TopBar } from '@/components/layout/TopBar';
import BudgetCalendar from '@/components/calendar/CalendarView';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export const Calendar = () => {
  const { state, dispatch } = useBudget();
  const { accounts, transactions } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSelectDay = (date: Date) => {
    setSelectedDate(date);
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (transaction: any) => {
    if (selectedTransaction) {
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: transaction,
      });
    } else {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: transaction,
      });
    }
  };

  return (
    <>
      <TopBar
        title="Calendar"
        hidePeriodSelector={true}
        onAddTransaction={() => {
          setSelectedTransaction(null);
          setSelectedDate(null);
          setIsModalOpen(true);
        }}
      />
      <div className="flex-1 overflow-hidden">
        <BudgetCalendar
          transactions={transactions}
          currency="CHF"
          onSelectDay={handleSelectDay}
        />
      </div>
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
        initial={selectedTransaction}
        defaultAccountId={accounts[0]?.id}
      />
    </>
  );
};

export default Calendar;
