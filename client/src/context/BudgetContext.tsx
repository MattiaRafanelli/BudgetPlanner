import React, { createContext, useContext, useReducer, useRef } from 'react';
import type { AppState } from '@/types';
import type { AppAction } from './actions';
import { reducer, initialState } from './reducer';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLoadApiData } from '@/hooks/useLoadApiData';
import { useSyncData } from '@/hooks/useSyncData';

interface BudgetContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  useLocalStorage(state, dispatch, initialized);
  useLoadApiData(dispatch, initialized);
  useSyncData(dispatch, initialized);

  return (
    <BudgetContext.Provider value={{ state, dispatch }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be used within BudgetProvider');
  return ctx;
}
