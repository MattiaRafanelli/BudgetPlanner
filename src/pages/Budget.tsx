import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { CategoryBudgetRow } from '@/components/budget/CategoryBudgetRow';
import { BudgetForm } from '@/components/budget/BudgetForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useBudget } from '@/hooks/useBudget';
import { useDerivedStats } from '@/hooks/useDerivedStats';
import type { BudgetLimit, TransactionCategory } from '@/types';
import { PieChart } from 'lucide-react';

export function Budget() {
  const { state, dispatch } = useBudget();
  const { budgetLimits } = state;
  const { monthlyExpenses, monthlyIncome, categorySpend, totalBudget } = useDerivedStats();

  const [showForm, setShowForm] = useState(false);
  const [editLimit, setEditLimit] = useState<BudgetLimit | null>(null);

  const handleSave = (limit: BudgetLimit) => {
    dispatch({ type: 'SET_BUDGET_LIMIT', payload: limit });
  };

  const handleSetLimit = (category: TransactionCategory) => {
    const existing = budgetLimits.find((l) => l.category === category);
    setEditLimit(existing ?? null);
    setShowForm(true);
  };

  const handleRemoveLimit = (category: TransactionCategory) => {
    dispatch({ type: 'DELETE_BUDGET_LIMIT', payload: { category } });
  };

  return (
    <>
      <TopBar title="Budget" />
      <PageContainer>
        <div className="space-y-6">
          {/* Budget overview */}
          <BudgetOverview
            spent={monthlyExpenses}
            totalBudget={totalBudget}
            income={monthlyIncome}
          />

          {/* Category limits */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Category Limits
            </h2>
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditLimit(null);
                setShowForm(true);
              }}
            >
              Set Limit
            </Button>
          </div>

          <Card className="p-2">
            {categorySpend.length === 0 ? (
              <EmptyState
                icon={<PieChart size={24} />}
                title="No spending data"
                description="Add transactions to see your spending breakdown and set budget limits."
              />
            ) : (
              <div className="space-y-0.5">
                {categorySpend.map((item) => (
                  <CategoryBudgetRow
                    key={item.category}
                    item={item}
                    onSetLimit={handleSetLimit}
                    onRemoveLimit={handleRemoveLimit}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </PageContainer>

      <BudgetForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        initial={editLimit}
      />
    </>
  );
}
