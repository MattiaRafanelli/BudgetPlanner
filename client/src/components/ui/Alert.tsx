import { ReactNode } from 'react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', children, className = '' }: AlertProps) {
  const baseStyles = 'px-4 py-3 rounded-lg mb-4 flex items-start gap-3';

  const variantStyles = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <span className="text-lg flex-shrink-0">{iconMap[variant]}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
