import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Plus,
} from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AccountSummaryRow } from '@/components/dashboard/AccountSummaryRow';
import { SpendingDonut } from '@/components/charts/SpendingDonut';
import { BudgetGauge } from '@/components/charts/BudgetGauge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useBudget } from '@/hooks/useBudget';
import { useDerivedStats } from '@/hooks/useDerivedStats';
import { formatCurrency, formatMonthYear } from '@/utils/formatters';
import { toDonutData } from '@/utils/chartHelpers';
import type { Transaction } from '@/types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { state, dispatch } = useBudget();
  const { accounts, transactions, activePeriod } = state;
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlyNet,
    totalBalance,
    categorySpend,
    budgetPercentage,
    totalBudget,
  } = useDerivedStats();

  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const donutData = toDonutData(categorySpend);

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
        title={`Overview — ${formatMonthYear(activePeriod.month, activePeriod.year)}`}
        onAddTransaction={() => {
          setEditTx(null);
          setShowForm(true);
        }}
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Account strip */}
          {accounts.length > 0 && (
            <AccountSummaryRow
              onSelectAccount={(id) =>
                dispatch({ type: 'SELECT_ACCOUNT', payload: { id } })
              }
              onNavigateAccounts={() => onNavigate('accounts')}
            />
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title="Total Balance"
              value={formatCurrency(totalBalance)}
              color="primary"
              icon={<Wallet size={20} />}
            />
            <StatCard
              title="Income"
              value={formatCurrency(monthlyIncome)}
              color="green"
              icon={<TrendingUp size={20} />}
            />
            <StatCard
              title="Expenses"
              value={formatCurrency(monthlyExpenses)}
              color="red"
              icon={<TrendingDown size={20} />}
            />
            <StatCard
              title="Net Savings"
              value={formatCurrency(monthlyNet)}
              color={monthlyNet >= 0 ? 'green' : 'red'}
              icon={<Target size={20} />}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Spending donut */}
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Spending Breakdown
              </h3>
              <SpendingDonut
                data={donutData}
                total={monthlyExpenses}
              />
            </Card>

            {/* Budget gauge */}
            <Card className="p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Budget Status
              </h3>
              {totalBudget > 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <BudgetGauge
                    percentage={budgetPercentage}
                    spent={monthlyExpenses}
                    total={totalBudget}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                  <p className="text-sm text-text-muted">No budget limits set</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigate('budget')}
                  >
                    Set Budget
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Recent transactions */}
          {accounts.length === 0 ? (
            <Card className="p-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
                <Wallet size={28} className="text-accent-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-semibold text-text-primary mb-1">
                  Welcome to Budget Planner
                </h3>
                <p className="text-sm text-text-muted max-w-sm">
                  Start by adding an account, then track your income and expenses.
                </p>
              </div>
              <Button
                onClick={() => onNavigate('accounts')}
                icon={<Plus size={16} />}
              >
                Add Your First Account
              </Button>
            </Card>
          ) : (
            <RecentTransactions
              transactions={transactions}
              accounts={accounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewAll={() => onNavigate('transactions')}
            />
          )}
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
