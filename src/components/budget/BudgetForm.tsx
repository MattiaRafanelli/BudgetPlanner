import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { BudgetLimit } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useCategories } from '@/hooks/useCategories';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (limit: BudgetLimit) => void;
  initial?: BudgetLimit | null;
}

export function BudgetForm({ isOpen, onClose, onSave, initial }: BudgetFormProps) {
  const { getGroupedExpenseOptions, getCategoryIcon, getCategoryColor } = useCategories();

  const [category, setCategory]       = useState('food');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [errors, setErrors]           = useState<Record<string, string>>({});

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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ id: initial?.id ?? uuidv4(), category, monthlyLimit: Number(monthlyLimit) });
    onClose();
  };

  const groups = getGroupedExpenseOptions();
  const selectedColor = getCategoryColor(category);
  const selectedIcon  = getCategoryIcon(category);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Budget Limit' : 'Set Budget Limit'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Category select — grouped */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">Category</label>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <DynamicIcon name={selectedIcon} size={16} style={{ color: selectedColor }} />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!initial}
              className="flex-1 bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all disabled:opacity-50"
            >
              {groups.map(({ parent, children }) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>{'  ↳ '}{child.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Monthly Limit"
          type="number" min="0" step="0.01" placeholder="0.00"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
          error={errors.monthlyLimit}
        />

        {monthlyLimit && !isNaN(Number(monthlyLimit)) && (
          <p className="text-xs text-text-muted">
            Yearly: ×12 = {(Number(monthlyLimit) * 12).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save Changes' : 'Set Limit'}</Button>
        </div>
      </form>
    </Modal>
  );
}
