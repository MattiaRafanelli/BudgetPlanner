import type { AppState } from '@/types';
import type { AppAction } from './actions';

export const initialState: AppState = {
  accounts: [],
  transactions: [],
  budgetLimits: [],
  activePeriod: {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  selectedAccountId: null,
  ui: {
    sidebarCollapsed: false,
    theme: 'dark',
  },
};

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload.id),
      };

    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };

    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload.id),
        transactions: state.transactions.filter(
          (t) => t.accountId !== action.payload.id && t.toAccountId !== action.payload.id
        ),
        selectedAccountId:
          state.selectedAccountId === action.payload.id
            ? null
            : state.selectedAccountId,
      };

    case 'SET_BUDGET_LIMIT': {
      const exists = state.budgetLimits.some(
        (b) => b.category === action.payload.category
      );
      return {
        ...state,
        budgetLimits: exists
          ? state.budgetLimits.map((b) =>
              b.category === action.payload.category ? action.payload : b
            )
          : [...state.budgetLimits, action.payload],
      };
    }

    case 'DELETE_BUDGET_LIMIT':
      return {
        ...state,
        budgetLimits: state.budgetLimits.filter(
          (b) => b.category !== action.payload.category
        ),
      };

    case 'SET_PERIOD':
      return { ...state, activePeriod: action.payload };

    case 'SELECT_ACCOUNT':
      return { ...state, selectedAccountId: action.payload.id };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
      };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
