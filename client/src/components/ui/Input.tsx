import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all ${leftIcon ? 'pl-9' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-accent-red">{error}</span>}
    </div>
  );
}
