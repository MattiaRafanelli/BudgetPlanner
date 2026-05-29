import { useEffect } from 'react';
import type { AppAction } from '@/context/actions';

/**
 * Hook to sync data from backend at regular intervals
 * Detects changes made on other devices and updates local state
 */
export function useSyncData(
  dispatch: React.Dispatch<AppAction>,
  initialized: React.MutableRefObject<boolean>
) {
  useEffect(() => {
    if (!initialized.current) return;

    const syncData = async () => {
      try {
        // Get auth token from session
        const session = sessionStorage.getItem('userSession');
        if (!session) return; // Not authenticated, don't sync
        
        let token: string;
        try {
          const parsed = JSON.parse(session);
          token = parsed.token;
        } catch {
          return;
        }
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch accounts
        const accountsRes = await fetch('/api/accounts', { headers });
        if (accountsRes.ok) {
          const accounts = await accountsRes.json();
          const transformedAccounts = accounts.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            currency: acc.currency,
            initialBalance: acc.balance || 0,
            color: acc.color || '#8B5CF6',
            icon: acc.icon || 'Wallet',
            isArchived: acc.is_active === false,
            createdAt: acc.created_at || new Date().toISOString(),
          }));
          dispatch({ type: 'SET_ACCOUNTS', payload: transformedAccounts });
        }

        // Fetch transactions
        const transactionsRes = await fetch('/api/transactions', { headers });
        if (transactionsRes.ok) {
          const transactions = await transactionsRes.json();
          const transformedTransactions = transactions.map((tx: any) => ({
            id: tx.id,
            accountId: tx.account_id,
            toAccountId: tx.to_account_id,
            type: tx.type,
            category: tx.category_id,
            amount: tx.amount,
            description: tx.description || '',
            date: tx.date,
            recurrence: tx.recurrence || 'none',
            tags: tx.tags || [],
            createdAt: tx.created_at || new Date().toISOString(),
            updatedAt: tx.updated_at || new Date().toISOString(),
          }));
          dispatch({ type: 'SET_TRANSACTIONS', payload: transformedTransactions });
        }
      } catch (error) {
        console.error('Failed to sync data from API:', error);
      }
    };

    // Start syncing after 2 seconds, then every 5 seconds
    const timeoutId = setTimeout(() => {
      syncData();
      const interval = setInterval(syncData, 5000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [dispatch, initialized]);
}
