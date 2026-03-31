import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getBarColor(percentage: number): string {
  if (percentage >= 100) return 'bg-accent-red';
  if (percentage >= 90) return 'bg-accent-red';
  if (percentage >= 70) return 'bg-accent-amber';
  return 'bg-accent-green';
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const barColor = getBarColor(percentage);

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-border rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs tabular-nums text-text-secondary w-10 text-right">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
