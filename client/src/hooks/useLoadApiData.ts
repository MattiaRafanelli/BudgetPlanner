import { useEffect } from 'react';
import type { AppAction } from '@/context/actions';

/**
 * Hook to load data from the backend API on app startup
 * Fetches accounts and transactions from the backend and populates the Redux state
 */
export function useLoadApiData(
  dispatch: React.Dispatch<AppAction>,
  initialized: React.MutableRefObject<boolean>
) {
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get auth token
        const session = sessionStorage.getItem('userSession');
        let token = '';
        if (session) {
          try {
            const parsed = JSON.parse(session);
            token = parsed.token;
          } catch {
            // ignore
          }
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch categories first
        const categoriesRes = await fetch('/api/categories', { headers });
        if (categoriesRes.ok) {
          const { data: categories } = await categoriesRes.json();
          // Build a mapping of category name/slug to ID for use in transactions
          const categoryMap: Record<string, string> = {};
          categories.forEach((cat: any) => {
            // Map by id (slug-like: "food", "housing") to UUID
            categoryMap[cat.id] = cat.id; // Keep as UUID
          });
          // Store in a way that TransactionForm can access it
          sessionStorage.setItem('categoryMap', JSON.stringify(categoryMap));
        }

        // Fetch accounts
        const accountsRes = await fetch('/api/accounts', { headers });
        if (accountsRes.ok) {
          const accounts = await accountsRes.json();
          // Transform backend snake_case to frontend camelCase
          const transformedAccounts = accounts.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            currency: acc.currency,
            initialBalance: isNaN(Number(acc.balance)) ? 0 : Number(acc.balance),
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
          // Transform backend snake_case to frontend camelCase
          const transformedTransactions = transactions.map((tx: any) => ({
            id: tx.id,
            accountId: tx.account_id,
            toAccountId: tx.to_account_id,
            type: tx.type,
            category: tx.category_id,
            amount: tx.amount,
            description: tx.description || '',
            date: tx.transaction_date,
            recurrence: tx.recurrence || 'none',
            tags: tx.tags || [],
            createdAt: tx.created_at || new Date().toISOString(),
            updatedAt: tx.updated_at || new Date().toISOString(),
          }));
          dispatch({ type: 'SET_TRANSACTIONS', payload: transformedTransactions });
        }

        initialized.current = true;
      } catch (error) {
        console.error('Failed to load data from API:', error);
        // If API fails, continue with local storage data
        initialized.current = true;
      }
    };

    // Only load once
    if (!initialized.current) {
      loadData();
    }
  }, [dispatch, initialized]);
}
