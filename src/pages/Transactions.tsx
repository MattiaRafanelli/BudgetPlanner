import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters, type Filters } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBudget } from '@/hooks/useBudget';
import type { Transaction } from '@/types';

export function Transactions() {
  const { state, dispatch } = useBudget();
  const { accounts, transactions, activePeriod } = state;

  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    category: 'all',
    accountId: 'all',
  });

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const inPeriod =
        d.getMonth() + 1 === activePeriod.month && d.getFullYear() === activePeriod.year;
      if (!inPeriod) return false;
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.accountId !== 'all' && t.accountId !== filters.accountId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !t.description.toLowerCase().includes(q) &&
          !String(t.amount).includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transactions, activePeriod, filters]);

  const handleSave = (tx: Transaction) => {
    if (editTx) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: { id } });
  };

  return (
    <>
      <TopBar
        title="Transactions"
        onAddTransaction={() => {
          setEditTx(null);
          setShowForm(true);
        }}
      />
      <PageContainer>
        <div className="space-y-4">
          <TransactionFilters
            filters={filters}
            onChange={setFilters}
            accounts={accounts}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <Card className="p-2">
            <TransactionList
              transactions={filtered}
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </div>
      </PageContainer>

      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        accounts={accounts}
        initial={editTx}
      />
    </>
  );
}
