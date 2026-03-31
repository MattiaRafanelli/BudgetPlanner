import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={
        color
          ? { backgroundColor: `${color}20`, color }
          : { backgroundColor: 'rgba(108,99,255,0.15)', color: '#6C63FF' }
      }
    >
      {children}
    </span>
  );
}
