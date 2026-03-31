import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { formatPercentage, formatCurrency } from '@/utils/formatters';

interface BudgetGaugeProps {
  percentage: number;
  spent: number;
  total: number;
  currency?: string;
}

function getColor(pct: number): string {
  if (pct >= 100) return '#EF4444';
  if (pct >= 90) return '#EF4444';
  if (pct >= 70) return '#F59E0B';
  return '#22C55E';
}

export function BudgetGauge({ percentage, spent, total, currency = 'EUR' }: BudgetGaugeProps) {
  const clamped = Math.min(percentage, 100);
  const color = getColor(percentage);

  const data = [
    { value: 100, fill: '#2E3146' },
    { value: clamped, fill: color },
  ];

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={160} height={160}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <RadialBar dataKey="value" cornerRadius={8} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {formatPercentage(percentage)}
        </span>
        <span className="text-xs text-text-muted mt-1">of budget</span>
        {total > 0 && (
          <span className="text-xs text-text-secondary mt-0.5 tabular-nums">
            {formatCurrency(spent, currency, true)} / {formatCurrency(total, currency, true)}
          </span>
        )}
      </div>
    </div>
  );
}
