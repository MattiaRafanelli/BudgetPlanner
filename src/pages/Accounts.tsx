import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { PageContainer } from '@/components/layout/PageContainer';
import { AccountList } from '@/components/accounts/AccountList';
import { AccountForm } from '@/components/accounts/AccountForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';
import { computeAccountBalance } from '@/utils/calculations';
import { DynamicIcon } from '@/components/DynamicIcon';
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS } from '@/constants';
import type { Account, Transaction } from '@/types';

export function Accounts() {
  const { state, dispatch } = useBudget();
  const { accounts, transactions, activePeriod } = state;

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTxForm, setShowTxForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const selected = selectedId ? accounts.find((a) => a.id === selectedId) : null;

  const selectedTxs = selectedId
    ? transactions.filter((t) => t.accountId === selectedId || t.toAccountId === selectedId)
    : [];

  const handleSaveAccount = (account: Account) => {
    if (editAccount) {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: account });
    } else {
      dispatch({ type: 'ADD_ACCOUNT', payload: account });
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Delete this account and all its transactions?')) {
      dispatch({ type: 'DELETE_ACCOUNT', payload: { id } });
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleSaveTx = (tx: Transaction) => {
    if (editTx) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: tx });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: tx });
    }
  };

  return (
    <>
      <TopBar title="Accounts" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {accounts.filter((a) => !a.isArchived).length} Account
                {accounts.length !== 1 ? 's' : ''}
              </h2>
            </div>
            <Button
              onClick={() => {
                setEditAccount(null);
                setShowAccountForm(true);
              }}
              icon={<Plus size={16} />}
            >
              New Account
            </Button>
          </div>

          {/* Account grid */}
          <AccountList
            accounts={accounts.filter((a) => !a.isArchived)}
            onEdit={(a) => {
              setEditAccount(a);
              setShowAccountForm(true);
            }}
            onDelete={handleDeleteAccount}
            onAdd={() => {
              setEditAccount(null);
              setShowAccountForm(true);
            }}
            onSelect={setSelectedId}
          />

          {/* Selected account detail */}
          {selected && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${selected.color}20` }}
                  >
                    <DynamicIcon
                      name={ACCOUNT_TYPE_ICONS[selected.type]}
                      size={20}
                      style={{ color: selected.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{selected.name}</h3>
                    <p className="text-xs text-text-muted">
                      {ACCOUNT_TYPE_LABELS[selected.type]} ·{' '}
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(
                          computeAccountBalance(selected, transactions),
                          selected.currency
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => {
                      setEditTx(null);
                      setShowTxForm(true);
                    }}
                  >
                    Add Transaction
                  </Button>
                </div>
              </div>

              <TransactionList
                transactions={selectedTxs}
                accounts={accounts}
                onEdit={(tx) => {
                  setEditTx(tx);
                  setShowTxForm(true);
                }}
                onDelete={(id) =>
                  dispatch({ type: 'DELETE_TRANSACTION', payload: { id } })
                }
              />
            </Card>
          )}
        </div>
      </PageContainer>

      <AccountForm
        isOpen={showAccountForm}
        onClose={() => setShowAccountForm(false)}
        onSave={handleSaveAccount}
        initial={editAccount}
      />

      <TransactionForm
        isOpen={showTxForm}
        onClose={() => setShowTxForm(false)}
        onSave={handleSaveTx}
        accounts={accounts}
        initial={editTx}
        defaultAccountId={selectedId ?? undefined}
      />
    </>
  );
}
