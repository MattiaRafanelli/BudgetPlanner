import { useEffect } from 'react';
import type { AppState } from '@/types';
import type { AppAction } from '@/context/actions';

const STORAGE_KEY = 'budgetplanner_v1';

interface StoredData {
  version: number;
  accounts: AppState['accounts'];
  transactions: AppState['transactions'];
  budgetLimits: AppState['budgetLimits'];
  customCategories: AppState['customCategories'];
  hiddenBuiltInCategories: AppState['hiddenBuiltInCategories'];
  activePeriod: AppState['activePeriod'];
}

export function loadFromStorage(): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: StoredData = JSON.parse(raw);
    if (data.version !== 1) return null;

    const accounts = (data.accounts ?? []).map((acc: any) => ({
      ...acc,
      initialBalance: isNaN(Number(acc.initialBalance)) ? 0 : Number(acc.initialBalance),
    }));

    return {
      accounts,
      transactions: data.transactions ?? [],
      budgetLimits: data.budgetLimits ?? [],
      customCategories: data.customCategories ?? [],
      hiddenBuiltInCategories: data.hiddenBuiltInCategories ?? [],
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
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
    initialized.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    const data: StoredData = {
      version: 1,
      accounts: state.accounts,
      transactions: state.transactions,
      budgetLimits: state.budgetLimits,
      customCategories: state.customCategories,
      hiddenBuiltInCategories: state.hiddenBuiltInCategories,
      activePeriod: state.activePeriod,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [state.accounts, state.transactions, state.budgetLimits, state.customCategories, state.activePeriod]);
}
