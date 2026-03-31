import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { BudgetLimit, TransactionCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, EXPENSE_CATEGORIES } from '@/constants';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (limit: BudgetLimit) => void;
  initial?: BudgetLimit | null;
}

const categoryOptions = EXPENSE_CATEGORIES.map((c) => ({
  value: c,
  label: CATEGORY_LABELS[c],
}));

export function BudgetForm({ isOpen, onClose, onSave, initial }: BudgetFormProps) {
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setCategory(initial.category);
      setMonthlyLimit(String(initial.monthlyLimit));
    } else {
      setCategory('food');
      setMonthlyLimit('');
    }
    setErrors({});
  }, [isOpen, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!monthlyLimit || isNaN(Number(monthlyLimit)) || Number(monthlyLimit) <= 0)
      errs.monthlyLimit = 'Enter a valid amount';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      id: initial?.id ?? uuidv4(),
      category,
      monthlyLimit: Number(monthlyLimit),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Budget Limit' : 'Set Budget Limit'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          disabled={!!initial}
        />
        <Input
          label="Monthly Limit"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          error={errors.monthlyLimit}
        />
        <p className="text-xs text-text-muted">
          Yearly limit: {monthlyLimit ? `×12 = ${(Number(monthlyLimit) * 12).toFixed(2)}` : '—'}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? 'Save Changes' : 'Set Limit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
