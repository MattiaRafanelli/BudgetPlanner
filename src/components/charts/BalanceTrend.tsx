import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { BalanceTrendPoint } from '@/utils/chartHelpers';
import { formatCurrency } from '@/utils/formatters';

interface BalanceTrendProps {
  data: BalanceTrendPoint[];
  currency?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-elevated border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-text-secondary mb-1">{label}</p>
      <p
        className={`text-sm font-bold tabular-nums ${val >= 0 ? 'text-accent-green' : 'text-accent-red'}`}
      >
        {formatCurrency(val, currency)}
      </p>
    </div>
  );
};

export function BalanceTrend({ data, currency = 'EUR' }: BalanceTrendProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#6C63FF"
          strokeWidth={2}
          fill="url(#balanceGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#6C63FF', stroke: '#1A1D27', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
