import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export function Badge({
  children,
  color,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: { backgroundColor: 'rgba(108,99,255,0.15)', color: '#6C63FF' },
    success: { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    danger: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444' },
    warning: { backgroundColor: 'rgba(234,179,8,0.15)', color: '#EAB308' },
    info: { backgroundColor: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  };

  const style = color
    ? { backgroundColor: `${color}20`, color }
    : variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
