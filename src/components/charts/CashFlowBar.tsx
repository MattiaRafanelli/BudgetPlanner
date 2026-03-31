import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CashFlowDataPoint } from '@/utils/chartHelpers';
import { formatCurrency } from '@/utils/formatters';

interface CashFlowBarProps {
  data: CashFlowDataPoint[];
  currency?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elevated border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-text-secondary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-text-secondary capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-semibold tabular-nums" style={{ color: p.color }}>
            {formatCurrency(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CashFlowBar({ data, currency = 'EUR' }: CashFlowBarProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#2E3146" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCurrency(v, currency, true)}
          width={60}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(46,49,70,0.5)' }} />
        <Bar dataKey="income" name="income" fill="#22C55E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
