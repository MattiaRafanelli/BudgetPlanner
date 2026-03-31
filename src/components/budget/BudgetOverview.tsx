import React from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { BudgetGauge } from '@/components/charts/BudgetGauge';
import { Card } from '@/components/ui/Card';

interface BudgetOverviewProps {
  spent: number;
  totalBudget: number;
  income: number;
  currency?: string;
}

export function BudgetOverview({
  spent,
  totalBudget,
  income,
  currency = 'EUR',
}: BudgetOverviewProps) {
  const percentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
  const remaining = totalBudget - spent;

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        Monthly Budget
      </h3>
      <div className="flex items-center gap-8">
        <BudgetGauge
          percentage={percentage}
          spent={spent}
          total={totalBudget}
          currency={currency}
        />

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Total Budget</p>
            <p className="text-xl font-bold tabular-nums text-text-primary">
              {totalBudget > 0 ? formatCurrency(totalBudget, currency) : 'Not set'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Spent</p>
              <p className="text-sm font-semibold tabular-nums text-accent-red">
                {formatCurrency(spent, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Remaining</p>
              <p
                className={`text-sm font-semibold tabular-nums ${
                  remaining >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {formatCurrency(Math.abs(remaining), currency)}
                {remaining < 0 && ' over'}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Income</p>
              <p className="text-sm font-semibold tabular-nums text-accent-green">
                {formatCurrency(income, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Savings</p>
              <p
                className={`text-sm font-semibold tabular-nums ${
                  income - spent >= 0 ? 'text-text-primary' : 'text-accent-red'
                }`}
              >
                {formatCurrency(income - spent, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
