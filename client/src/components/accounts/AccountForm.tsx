import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Account, AccountType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ACCOUNT_TYPE_LABELS, ACCOUNT_COLOR_PRESETS } from '@/constants';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  initial?: Account | null;
}

const typeOptions = Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const currencyOptions = [
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
];

export function AccountForm({ isOpen, onClose, onSave, initial }: AccountFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState('CHF');
  const [initialBalance, setInitialBalance] = useState('0');
  const [color, setColor] = useState(ACCOUNT_COLOR_PRESETS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setCurrency(initial.currency);
      setInitialBalance(String(initial.initialBalance));
      setColor(initial.color);
    } else {
      setName('');
      setType('bank');
      setCurrency('CHF');
      setInitialBalance('0');
      setColor(ACCOUNT_COLOR_PRESETS[0]);
    }
    setErrors({});
  }, [isOpen, initial]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (isNaN(Number(initialBalance))) errs.initialBalance = 'Enter a valid number';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Send to backend with correct field names
    try {
      const method = initial ? 'PUT' : 'POST';
      const url = initial ? `/api/accounts/${initial.id}` : '/api/accounts';

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

      // Transform account object for backend (use 'balance' instead of 'initialBalance')
      const backendPayload = {
        name: name.trim(),
        type,
        balance: Number(initialBalance),
        currency,
        color,
        icon: 'Wallet',
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save account to backend:', response.status, errorData);
        setErrors({ submit: errorData.error || 'Failed to save account' });
        return;
      }

      // Get the response from backend with real ID and data
      const savedAccount = await response.json();

      // Transform backend response to frontend Account type
      const account: Account = {
        id: savedAccount.id,
        name: savedAccount.name,
        type: savedAccount.type,
        currency: savedAccount.currency,
        initialBalance: isNaN(Number(savedAccount.balance)) ? 0 : Number(savedAccount.balance),
        color: savedAccount.color,
        icon: savedAccount.icon || 'Wallet',
        isArchived: savedAccount.is_active === false,
        createdAt: savedAccount.created_at || new Date().toISOString(),
      };

      onSave(account);
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
      setErrors({ submit: 'An error occurred while saving' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Edit Account' : 'New Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Name"
          placeholder="e.g. Main Bank, Cash Wallet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            options={typeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
          />
          <Select
            label="Currency"
            options={currencyOptions}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <Input
          label="Initial Balance"
          type="number"
          step="0.01"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          error={errors.initialBalance}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                title={`Color ${c}`}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all color-dynamic ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface scale-110' : ''
                }`}
                // @ts-expect-error CSS-in-JS for dynamic colors
                style={{ '--color': c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initial ? 'Save Changes' : 'Add Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
