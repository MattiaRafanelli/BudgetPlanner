import { useEffect } from 'react';
import type { AppState } from '@/types';
import type { AppAction } from '@/context/actions';

const STORAGE_KEY = 'budgetplanner_v1';

interface StoredData {
  version: number;
  accounts: AppState['accounts'];
  transactions: AppState['transactions'];
  budgetLimits: AppState['budgetLimits'];
  activePeriod: AppState['activePeriod'];
}

export function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: StoredData = JSON.parse(raw);
    if (data.version !== 1) return null;
    return {
      accounts: data.accounts ?? [],
      transactions: data.transactions ?? [],
      budgetLimits: data.budgetLimits ?? [],
      activePeriod: data.activePeriod,
    };
  } catch {
    return null;
  }
}

export function useLocalStorage(
  state: AppState,
  dispatch: React.Dispatch<AppAction>,
  initialized: React.MutableRefObject<boolean>
) {
  // Hydrate on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
    initialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on state change
  useEffect(() => {
    if (!initialized.current) return;
    const data: StoredData = {
      version: 1,
      accounts: state.accounts,
      transactions: state.transactions,
      budgetLimits: state.budgetLimits,
      activePeriod: state.activePeriod,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [state.accounts, state.transactions, state.budgetLimits, state.activePeriod]);
}
