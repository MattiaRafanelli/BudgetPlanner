import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all appearance-none ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-accent-red">{error}</span>}
    </div>
  );
}
