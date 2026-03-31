import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DonutDataPoint } from '@/utils/chartHelpers';
import { formatCurrency } from '@/utils/formatters';

interface SpendingDonutProps {
  data: DonutDataPoint[];
  total: number;
  currency?: string;
  compact?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { payload: DonutDataPoint; value: number }[];
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-elevated border border-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-text-primary">{item.payload.name}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: item.payload.color }}>
        {formatCurrency(item.value, currency)}
      </p>
    </div>
  );
};

export function SpendingDonut({
  data,
  total,
  currency = 'EUR',
  compact = false,
}: SpendingDonutProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        No expenses this period
      </div>
    );
  }

  return (
    <div className={`flex ${compact ? 'flex-col' : 'items-center gap-6'}`}>
      <div className={compact ? 'h-40' : 'h-48 w-48 shrink-0'}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={compact ? '55%' : '60%'}
              outerRadius={compact ? '85%' : '90%'}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip currency={currency} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-w-0">
        <div className="space-y-2">
          {data.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-text-secondary truncate flex-1 min-w-0">
                {item.name}
              </span>
              <span className="text-xs tabular-nums font-medium text-text-primary shrink-0">
                {formatCurrency(item.value, currency, true)}
              </span>
              <span className="text-xs tabular-nums text-text-muted w-10 text-right shrink-0">
                {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
