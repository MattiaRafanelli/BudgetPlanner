import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionType, Account } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  accounts: Account[];
  initial?: Transaction | null;
  defaultAccountId?: string;
}

const typeOptions: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Expense' },
  { value: 'income',  label: 'Income'  },
  { value: 'transfer',label: 'Transfer'},
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  isOpen,
  onClose,
  onSave,
  accounts,
  initial,
  defaultAccountId,
}: TransactionFormProps) {
  const { getGroupedExpenseOptions, getGroupedIncomeOptions } = useCategories();

  const [type, setType]               = useState<TransactionType>('expense');
  const [amount, setAmount]           = useState('');
  const [category, setCategory]       = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate]               = useState(today());
  const [accountId, setAccountId]     = useState(defaultAccountId ?? accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [errors, setErrors]           = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setType(initial.type);
      setAmount(String(initial.amount));
      setCategory(initial.category);
      setDescription(initial.description);
      setDate(initial.date);
      setAccountId(initial.accountId);
      setToAccountId(initial.toAccountId ?? '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('food');
      setDescription('');
      setDate(today());
      setAccountId(defaultAccountId ?? accounts[0]?.id ?? '');
      setToAccountId('');
    }
    setErrors({});
  }, [isOpen, initial, defaultAccountId, accounts]);

  useEffect(() => {
    if (type === 'income')   setCategory('salary');
    else if (type === 'expense') setCategory('food');
    else if (type === 'transfer') {
      const firstOther = accounts.find((a) => a.id !== accountId);
      setToAccountId(firstOther?.id ?? '');
    }
  }, [type, accountId, accounts]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errs.amount = 'Enter a valid amount';
    if (!accountId) errs.accountId = 'Select an account';
    if (type === 'transfer' && !toAccountId)       errs.toAccountId = 'Select destination account';
    if (type === 'transfer' && toAccountId === accountId) errs.toAccountId = 'Must be different from source';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const now = new Date().toISOString();
    const tx: Transaction = {
      id:          initial?.id ?? uuidv4(),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      type,
      category,
      amount:      Number(amount),
      description: description.trim(),
      date,
      recurrence: 'none',
      tags: [],
      createdAt:   initial?.createdAt ?? now,
      updatedAt:   now,
    };
    onSave(tx);
    onClose();
  };

  const groups = type === 'income'
    ? getGroupedIncomeOptions()
    : getGroupedExpenseOptions();

  const accountOptions = accounts.map((a) => ({ value: a.id, label: a.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Transaction' : 'New Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-elevated rounded-xl">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === opt.value ? 'bg-accent-primary text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number" min="0" step="0.01" placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Category select — grouped with subcategories */}
        {type !== 'transfer' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all"
            >
              {groups.map(({ parent, children }) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {'  ↳ '}{child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* Account selects */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-all"
          >
            {accountOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.accountId && <span className="text-xs text-accent-red">{errors.accountId}</span>}
        </div>

        {type === 'transfer' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">To Account</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-all"
            >
              {accountOptions.filter((a) => a.value !== accountId).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.toAccountId && <span className="text-xs text-accent-red">{errors.toAccountId}</span>}
          </div>
        )}

        <Input
          label="Description (optional)"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initial ? 'Save Changes' : 'Add Transaction'}</Button>
        </div>
      </form>
    </Modal>
  );
}
