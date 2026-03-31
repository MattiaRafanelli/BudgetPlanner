import React from 'react';
import { Search } from 'lucide-react';
import type { TransactionType, TransactionCategory } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CATEGORY_LABELS } from '@/constants';

export interface Filters {
  search: string;
  type: TransactionType | 'all';
  category: TransactionCategory | 'all';
  accountId: string | 'all';
}

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  accounts: { id: string; name: string }[];
}

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export function TransactionFilters({
  filters,
  onChange,
  accounts,
}: TransactionFiltersProps) {
  const accountOptions = [
    { value: 'all', label: 'All Accounts' },
    ...accounts.map((a) => ({ value: a.id, label: a.name })),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search transactions…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          leftIcon={<Search size={14} />}
        />
      </div>
      <Select
        options={typeOptions}
        value={filters.type}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as TransactionType | 'all' })
        }
        className="w-36"
      />
      <Select
        options={categoryOptions}
        value={filters.category}
        onChange={(e) =>
          onChange({
            ...filters,
            category: e.target.value as TransactionCategory | 'all',
          })
        }
        className="w-44"
      />
      <Select
        options={accountOptions}
        value={filters.accountId}
        onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
        className="w-40"
      />
    </div>
  );
}
