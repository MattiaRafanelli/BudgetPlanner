import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionType, TransactionCategory, Account } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Transaction) => void;
  accounts: Account[];
  initial?: Transaction | null;
  defaultAccountId?: string;
}

const typeOptions = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
];

function getCategoryOptions(type: TransactionType) {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return cats.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }));
}

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
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today());
  const [accountId, setAccountId] = useState(defaultAccountId ?? accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Update category when type changes
  useEffect(() => {
    if (type === 'income') setCategory('salary');
    else if (type === 'expense') setCategory('food');
  }, [type]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errs.amount = 'Enter a valid amount';
    if (!accountId) errs.accountId = 'Select an account';
    if (type === 'transfer' && !toAccountId) errs.toAccountId = 'Select destination account';
    if (type === 'transfer' && toAccountId === accountId)
      errs.toAccountId = 'Must be different from source';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: initial?.id ?? uuidv4(),
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      type,
      category,
      amount: Number(amount),
      description: description.trim(),
      date,
      recurrence: 'none',
      tags: [],
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(tx);
    onClose();
  };

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
              onClick={() => setType(opt.value as TransactionType)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                type === opt.value
                  ? 'bg-accent-primary text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
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

        {type !== 'transfer' && (
          <Select
            label="Category"
            options={getCategoryOptions(type)}
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          />
        )}

        <Select
          label={type === 'transfer' ? 'From Account' : 'Account'}
          options={accountOptions}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          error={errors.accountId}
        />

        {type === 'transfer' && (
          <Select
            label="To Account"
            options={accountOptions.filter((a) => a.value !== accountId)}
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            error={errors.toAccountId}
          />
        )}

        <Input
          label="Description (optional)"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
