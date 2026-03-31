import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  color?: 'green' | 'red' | 'primary' | 'neutral';
  icon: React.ReactNode;
}

const colors = {
  green: 'text-accent-green',
  red: 'text-accent-red',
  primary: 'text-accent-primary',
  neutral: 'text-text-primary',
};

const bgColors = {
  green: 'bg-accent-green/10',
  red: 'bg-accent-red/10',
  primary: 'bg-accent-primary/10',
  neutral: 'bg-elevated',
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  color = 'neutral',
  icon,
}: StatCardProps) {
  const TrendIcon = trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown;
  const trendColor = trend === undefined || trend === 0 ? 'text-text-muted' : trend > 0 ? 'text-accent-green' : 'text-accent-red';

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColors[color]}`}
        >
          <span className={colors[color]}>{icon}</span>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={13} />
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-2xl font-bold tabular-nums ${colors[color]}`}>{value}</p>
      {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
    </Card>
  );
}
