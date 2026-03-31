import React from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { CashFlowBar } from '@/components/charts/CashFlowBar';
import { BalanceTrend } from '@/components/charts/BalanceTrend';
import { SpendingDonut } from '@/components/charts/SpendingDonut';
import { Card } from '@/components/ui/Card';
import { useDerivedStats } from '@/hooks/useDerivedStats';
import { toCashFlowBarData, toDonutData, toBalanceTrendData } from '@/utils/chartHelpers';
import { formatCurrency } from '@/utils/formatters';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/constants';
import { DynamicIcon } from '@/components/DynamicIcon';
import { CATEGORY_ICONS } from '@/constants';

export function Reports() {
  const { monthlySummaries, categorySpend, monthlyExpenses, monthlyIncome, monthlyNet } =
    useDerivedStats();

  const cashFlowData = toCashFlowBarData(monthlySummaries);
  const donutData = toDonutData(categorySpend);
  const balanceData = toBalanceTrendData(monthlySummaries);

  return (
    <>
      <TopBar title="Reports" />
      <PageContainer>
        <div className="space-y-6">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-text-muted mb-1">This Month Income</p>
              <p className="text-xl font-bold tabular-nums text-accent-green">
                {formatCurrency(monthlyIncome)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-text-muted mb-1">This Month Expenses</p>
              <p className="text-xl font-bold tabular-nums text-accent-red">
                {formatCurrency(monthlyExpenses)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-text-muted mb-1">Net Balance</p>
              <p
                className={`text-xl font-bold tabular-nums ${
                  monthlyNet >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {formatCurrency(monthlyNet)}
              </p>
            </Card>
          </div>

          {/* Cash flow chart */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
              Income vs Expenses — Last 12 Months
            </h3>
            <CashFlowBar data={cashFlowData} />
          </Card>

          {/* Balance trend */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
              Cumulative Balance Trend
            </h3>
            <BalanceTrend data={balanceData} />
          </Card>

          {/* Spending breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Spending by Category
              </h3>
              <SpendingDonut
                data={donutData}
                total={monthlyExpenses}
              />
            </Card>

            {/* Category table */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {categorySpend
                  .filter((c) => c.spent > 0)
                  .slice(0, 8)
                  .map((item) => {
                    const color = CATEGORY_COLORS[item.category];
                    const pct = monthlyExpenses > 0 ? (item.spent / monthlyExpenses) * 100 : 0;
                    return (
                      <div key={item.category} className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <DynamicIcon
                            name={CATEGORY_ICONS[item.category]}
                            size={14}
                            style={{ color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-text-primary">
                              {CATEGORY_LABELS[item.category]}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs tabular-nums text-text-secondary">
                                {formatCurrency(item.spent, 'EUR', true)}
                              </span>
                              <span className="text-xs tabular-nums text-text-muted w-8 text-right">
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {categorySpend.filter((c) => c.spent > 0).length === 0 && (
                  <p className="text-sm text-text-muted text-center py-6">
                    No expense data for this period
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
