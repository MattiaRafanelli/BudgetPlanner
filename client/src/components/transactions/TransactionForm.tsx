import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction, TransactionType, Account } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryLookup } from '@/hooks/useCategoryLookup';
import { getPaydayString } from '@/utils/payday';

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
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  date: string;
  accountId: string;
  toAccountId: string;
  lastExpenseCategory: string;
  lastIncomeCategory: string;
}

const getInitialState = (
  initial: Transaction | null | undefined,
  defaultAccountId: string | undefined,
  accounts: Account[]
): FormState => {
  if (initial) {
    return {
      type: initial.type,
      amount: String(initial.amount),
      category: initial.category,
      description: initial.description,
      date: initial.date,
      accountId: initial.accountId,
      toAccountId: initial.toAccountId ?? '',
      lastExpenseCategory: 'food',
      lastIncomeCategory: 'salary',
    };
  }

  return {
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: today(),
    accountId: defaultAccountId ?? accounts[0]?.id ?? '',
    toAccountId: '',
    lastExpenseCategory: 'food',
    lastIncomeCategory: 'salary',
  };
};

export function TransactionForm({
  isOpen,
  onClose,
  onSave,
  accounts,
  initial,
  defaultAccountId,
}: TransactionFormProps) {
  const { getGroupedExpenseOptions, getGroupedIncomeOptions } = useCategories();
  const { getCategoryId } = useCategoryLookup();

  const [formState, setFormState] = useState<FormState>(
    getInitialState(initial, defaultAccountId, accounts)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialState(initial, defaultAccountId, accounts));
      setErrors({});
    }
  }, [isOpen]);

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setFormState((prev) => {
      // Speichere die aktuelle Kategorie für den aktuellen Type
      let updatedState = { ...prev };
      
      if (prev.type === 'expense') {
        updatedState.lastExpenseCategory = prev.category;
      } else if (prev.type === 'income') {
        updatedState.lastIncomeCategory = prev.category;
      }

      // Wechsle zum neuen Type und setze die gespeicherte Kategorie
      updatedState.type = newType;
      
      if (newType === 'expense') {
        updatedState.category = updatedState.lastExpenseCategory;
        updatedState.date = today();
      } else if (newType === 'income') {
        updatedState.category = updatedState.lastIncomeCategory;
        updatedState.date = getPaydayString();
      } else if (newType === 'transfer') {
        updatedState.date = today();
        const firstOther = accounts.find((a) => a.id !== updatedState.accountId);
        updatedState.toAccountId = firstOther?.id ?? '';
      }

      return updatedState;
    });
  }, [accounts]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, amount: e.target.value }));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, date: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => {
      const newCategory = e.target.value;
      const updated = { ...prev, category: newCategory };

      // Speichere auch in lastExpenseCategory oder lastIncomeCategory
      if (prev.type === 'expense') {
        updated.lastExpenseCategory = newCategory;
      } else if (prev.type === 'income') {
        updated.lastIncomeCategory = newCategory;
      }

      return updated;
    });
  }, []);

  const handleAccountChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, accountId: e.target.value }));
  }, []);

  const handleToAccountChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, toAccountId: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (!formState.amount || isNaN(Number(formState.amount)) || Number(formState.amount) <= 0) {
      errs.amount = 'Enter a valid amount';
    }

    if (!formState.accountId) {
      errs.accountId = 'Select an account';
    }

    if (formState.type === 'transfer' && !formState.toAccountId) {
      errs.toAccountId = 'Select destination account';
    }

    if (formState.type === 'transfer' && formState.toAccountId === formState.accountId) {
      errs.toAccountId = 'Must be different from source';
    }

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();
    const tx: Transaction = {
      id: initial?.id ?? uuidv4(),
      accountId: formState.accountId,
      toAccountId: formState.type === 'transfer' ? formState.toAccountId : undefined,
      type: formState.type,
      category: formState.category,
      amount: Number(formState.amount),
      description: formState.description.trim(),
      date: formState.date,
      recurrence: 'none',
      tags: [],
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };

    // Send to backend
    try {
      const method = initial ? 'PUT' : 'POST';
      const url = initial ? `/api/transactions/${tx.id}` : '/api/transactions';

      // Get auth token
      const session = sessionStorage.getItem('userSession');
      let token = '';
      if (session) {
        try {
          const parsed = JSON.parse(session);
          token = parsed.token;
        } catch {
          console.warn('Could not parse session');
        }
      }

      // Transform for backend
      const backendPayload = {
        account_id: tx.accountId,
        category_id: getCategoryId(tx.category),
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        date: tx.date,
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(backendPayload),
      });

      if (response.ok) {
        console.log('Successfully sent to backend!');
      } else {
        console.error('Backend error:', response.status);
      }
    } catch (error) {
      console.error('Error sending to database:', error);
    }

    onSave(tx);
    onClose();
  };

  const groups =
    formState.type === 'income'
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
              onClick={() => handleTypeChange(opt.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                formState.type === opt.value
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
            value={formState.amount}
            onChange={handleAmountChange}
            error={errors.amount}
          />
          <Input
            label="Date"
            type="date"
            value={formState.date}
            onChange={handleDateChange}
          />
        </div>

        {/* Category select */}
        {formState.type !== 'transfer' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Category
            </label>
            <select
              title="Select transaction category"
              value={formState.category}
              onChange={handleCategoryChange}
              className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 transition-all"
            >
              {groups.map(({ parent, children }) => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name}</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {'  ↳ '}
                      {child.name}
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
            {formState.type === 'transfer' ? 'From Account' : 'Account'}
          </label>
          <select
            title={
              formState.type === 'transfer'
                ? 'Select source account'
                : 'Select account'
            }
            value={formState.accountId}
            onChange={handleAccountChange}
            className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-all"
          >
            {accountOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <span className="text-xs text-accent-red">{errors.accountId}</span>
          )}
        </div>

        {formState.type === 'transfer' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              To Account
            </label>
            <select
              title="Select destination account"
              value={formState.toAccountId}
              onChange={handleToAccountChange}
              className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition-all"
            >
              {accountOptions
                .filter((a) => a.value !== formState.accountId)
                .map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
            </select>
            {errors.toAccountId && (
              <span className="text-xs text-accent-red">{errors.toAccountId}</span>
            )}
          </div>
        )}

        <Input
          label="Description (optional)"
          placeholder="What was this for?"
          value={formState.description}
          onChange={handleDescriptionChange}
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