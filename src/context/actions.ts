import type {
  Account,
  Transaction,
  BudgetLimit,
  BudgetPeriod,
  Category,
  AppState,
} from '@/types';

export type AppAction =
  | { type: 'ADD_TRANSACTION';    payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: { id: string } }
  | { type: 'ADD_ACCOUNT';        payload: Account }
  | { type: 'UPDATE_ACCOUNT';     payload: Account }
  | { type: 'DELETE_ACCOUNT';     payload: { id: string } }
  | { type: 'SET_BUDGET_LIMIT';   payload: BudgetLimit }
  | { type: 'DELETE_BUDGET_LIMIT';payload: { category: string } }
  | { type: 'ADD_CATEGORY';       payload: Category }
  | { type: 'UPDATE_CATEGORY';    payload: Category }
  | { type: 'DELETE_CATEGORY';    payload: { id: string } }
  | { type: 'SET_PERIOD';         payload: BudgetPeriod }
  | { type: 'SELECT_ACCOUNT';     payload: { id: string | null } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'LOAD_STATE';         payload: Partial<AppState> };
