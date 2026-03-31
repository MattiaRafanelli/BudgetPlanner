/**
 * Sample corporate budget plan
 * Weekly revenue: €50,000,000
 * Monthly revenue: €50M × (52/12) ≈ €216,666,667
 *
 * Category mapping (personal app → corporate function):
 *   housing       → Facilities & Real Estate
 *   food          → Catering & Food Services
 *   transport     → Logistics & Fleet
 *   healthcare    → Employee Benefits & Welfare
 *   entertainment → Marketing & Corporate Events
 *   shopping      → Equipment & Procurement
 *   education     → Training & Development
 *   utilities     → Infrastructure & IT
 *   subscriptions → Software & SaaS
 *   personal      → General Operations
 *   other_expense → Contingency Reserve
 *   salary        → Monthly Revenue
 */

import type { Account, Transaction, BudgetLimit, AppState } from '@/types';

const MONTH = 3;
const YEAR  = 2026;
const d = (day: number) => `${YEAR}-${String(MONTH).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

// ── Accounts ────────────────────────────────────────────────────────────────

export const sampleAccounts: Account[] = [
  {
    id: 'acc-operating',
    name: 'Main Operating',
    type: 'bank',
    currency: 'EUR',
    initialBalance: 50_000_000,
    color: '#3B82F6',
    icon: 'Building2',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'acc-payroll',
    name: 'Payroll Account',
    type: 'bank',
    currency: 'EUR',
    initialBalance: 30_000_000,
    color: '#22C55E',
    icon: 'Building2',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'acc-reserve',
    name: 'Reserve Fund',
    type: 'savings',
    currency: 'EUR',
    initialBalance: 100_000_000,
    color: '#14B8A6',
    icon: 'PiggyBank',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'acc-petty',
    name: 'Petty Cash',
    type: 'cash',
    currency: 'EUR',
    initialBalance: 500_000,
    color: '#F97316',
    icon: 'Banknote',
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

// ── Budget limits (monthly) ──────────────────────────────────────────────────
// Total budget: ~€80.2M/month (~37% of revenue — leaves 63% for payroll + profit)

export const sampleBudgetLimits: BudgetLimit[] = [
  { id: 'bl-01', category: 'housing',       monthlyLimit: 8_500_000  }, // Facilities 4%
  { id: 'bl-02', category: 'food',          monthlyLimit: 2_200_000  }, // Catering   1%
  { id: 'bl-03', category: 'transport',     monthlyLimit: 10_800_000 }, // Logistics  5%
  { id: 'bl-04', category: 'healthcare',    monthlyLimit: 15_200_000 }, // Benefits   7%
  { id: 'bl-05', category: 'entertainment', monthlyLimit: 6_500_000  }, // Marketing  3%
  { id: 'bl-06', category: 'shopping',      monthlyLimit: 8_700_000  }, // Equipment  4%
  { id: 'bl-07', category: 'education',     monthlyLimit: 4_300_000  }, // Training   2%
  { id: 'bl-08', category: 'utilities',     monthlyLimit: 4_300_000  }, // Infra/IT   2%
  { id: 'bl-09', category: 'subscriptions', monthlyLimit: 2_200_000  }, // SaaS       1%
  { id: 'bl-10', category: 'personal',      monthlyLimit: 13_000_000 }, // Operations 6%
  { id: 'bl-11', category: 'other_expense', monthlyLimit: 4_300_000  }, // Contingency 2%
];

// ── Transactions ─────────────────────────────────────────────────────────────

export const sampleTransactions: Transaction[] = [
  // ── INCOME ──────────────────────────────────────────────────────────────
  {
    id: 'tx-rev-wk1', accountId: 'acc-operating', type: 'income', category: 'salary',
    amount: 50_000_000, description: 'Weekly Revenue – Week 1',
    date: d(7), recurrence: 'weekly', tags: ['revenue'], createdAt: d(7)+'T00:00:00Z', updatedAt: d(7)+'T00:00:00Z',
  },
  {
    id: 'tx-rev-wk2', accountId: 'acc-operating', type: 'income', category: 'salary',
    amount: 50_000_000, description: 'Weekly Revenue – Week 2',
    date: d(14), recurrence: 'weekly', tags: ['revenue'], createdAt: d(14)+'T00:00:00Z', updatedAt: d(14)+'T00:00:00Z',
  },
  {
    id: 'tx-rev-wk3', accountId: 'acc-operating', type: 'income', category: 'salary',
    amount: 50_000_000, description: 'Weekly Revenue – Week 3',
    date: d(21), recurrence: 'weekly', tags: ['revenue'], createdAt: d(21)+'T00:00:00Z', updatedAt: d(21)+'T00:00:00Z',
  },
  {
    id: 'tx-rev-wk4', accountId: 'acc-operating', type: 'income', category: 'salary',
    amount: 50_000_000, description: 'Weekly Revenue – Week 4',
    date: d(28), recurrence: 'weekly', tags: ['revenue'], createdAt: d(28)+'T00:00:00Z', updatedAt: d(28)+'T00:00:00Z',
  },
  {
    id: 'tx-inv', accountId: 'acc-reserve', type: 'income', category: 'investment',
    amount: 1_240_000, description: 'Investment Portfolio Returns',
    date: d(15), recurrence: 'monthly', tags: ['investment'], createdAt: d(15)+'T00:00:00Z', updatedAt: d(15)+'T00:00:00Z',
  },

  // ── EXPENSES — Facilities & Real Estate ────────────────────────────────
  {
    id: 'tx-exp-01', accountId: 'acc-operating', type: 'expense', category: 'housing',
    amount: 4_200_000, description: 'Office Lease – HQ & Regional Offices',
    date: d(1), recurrence: 'monthly', tags: ['facilities'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-02', accountId: 'acc-operating', type: 'expense', category: 'housing',
    amount: 1_850_000, description: 'Warehouse & Distribution Centers',
    date: d(1), recurrence: 'monthly', tags: ['facilities'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-03', accountId: 'acc-operating', type: 'expense', category: 'housing',
    amount: 960_000, description: 'Facilities Maintenance & Security',
    date: d(10), recurrence: 'monthly', tags: ['facilities'], createdAt: d(10)+'T00:00:00Z', updatedAt: d(10)+'T00:00:00Z',
  },

  // ── EXPENSES — Catering & Food Services ───────────────────────────────
  {
    id: 'tx-exp-04', accountId: 'acc-petty', type: 'expense', category: 'food',
    amount: 980_000, description: 'Staff Canteen & Catering Services',
    date: d(5), recurrence: 'monthly', tags: ['hr'], createdAt: d(5)+'T00:00:00Z', updatedAt: d(5)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-05', accountId: 'acc-petty', type: 'expense', category: 'food',
    amount: 620_000, description: 'Client & Board Meeting Catering',
    date: d(12), recurrence: 'none', tags: ['client'], createdAt: d(12)+'T00:00:00Z', updatedAt: d(12)+'T00:00:00Z',
  },

  // ── EXPENSES — Logistics & Fleet ──────────────────────────────────────
  {
    id: 'tx-exp-06', accountId: 'acc-operating', type: 'expense', category: 'transport',
    amount: 5_300_000, description: 'Fleet Leasing & Vehicle Maintenance',
    date: d(1), recurrence: 'monthly', tags: ['logistics'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-07', accountId: 'acc-operating', type: 'expense', category: 'transport',
    amount: 2_400_000, description: 'Freight & Shipping Costs',
    date: d(8), recurrence: 'none', tags: ['logistics'], createdAt: d(8)+'T00:00:00Z', updatedAt: d(8)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-08', accountId: 'acc-operating', type: 'expense', category: 'transport',
    amount: 890_000, description: 'Business Travel & Employee Commuting',
    date: d(15), recurrence: 'monthly', tags: ['travel'], createdAt: d(15)+'T00:00:00Z', updatedAt: d(15)+'T00:00:00Z',
  },

  // ── EXPENSES — Employee Benefits & Welfare ────────────────────────────
  {
    id: 'tx-exp-09', accountId: 'acc-payroll', type: 'expense', category: 'healthcare',
    amount: 8_200_000, description: 'Health Insurance Premiums (2,400 employees)',
    date: d(1), recurrence: 'monthly', tags: ['benefits'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-10', accountId: 'acc-payroll', type: 'expense', category: 'healthcare',
    amount: 3_400_000, description: 'Pension & Retirement Contributions',
    date: d(1), recurrence: 'monthly', tags: ['benefits'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-11', accountId: 'acc-payroll', type: 'expense', category: 'healthcare',
    amount: 1_950_000, description: 'Wellness Programs & Employee Assistance',
    date: d(5), recurrence: 'monthly', tags: ['benefits'], createdAt: d(5)+'T00:00:00Z', updatedAt: d(5)+'T00:00:00Z',
  },

  // ── EXPENSES — Marketing & Corporate Events ───────────────────────────
  {
    id: 'tx-exp-12', accountId: 'acc-operating', type: 'expense', category: 'entertainment',
    amount: 2_800_000, description: 'Digital & Print Advertising Campaigns',
    date: d(3), recurrence: 'monthly', tags: ['marketing'], createdAt: d(3)+'T00:00:00Z', updatedAt: d(3)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-13', accountId: 'acc-operating', type: 'expense', category: 'entertainment',
    amount: 1_200_000, description: 'Trade Show & Conference Participation',
    date: d(18), recurrence: 'none', tags: ['marketing'], createdAt: d(18)+'T00:00:00Z', updatedAt: d(18)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-14', accountId: 'acc-operating', type: 'expense', category: 'entertainment',
    amount: 560_000, description: 'Client Hospitality & Corporate Gifts',
    date: d(20), recurrence: 'monthly', tags: ['client'], createdAt: d(20)+'T00:00:00Z', updatedAt: d(20)+'T00:00:00Z',
  },

  // ── EXPENSES — Equipment & Procurement ────────────────────────────────
  {
    id: 'tx-exp-15', accountId: 'acc-operating', type: 'expense', category: 'shopping',
    amount: 4_100_000, description: 'Raw Materials & Component Procurement',
    date: d(3), recurrence: 'monthly', tags: ['procurement'], createdAt: d(3)+'T00:00:00Z', updatedAt: d(3)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-16', accountId: 'acc-operating', type: 'expense', category: 'shopping',
    amount: 2_200_000, description: 'Office Equipment & Hardware Refresh',
    date: d(10), recurrence: 'none', tags: ['equipment'], createdAt: d(10)+'T00:00:00Z', updatedAt: d(10)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-17', accountId: 'acc-operating', type: 'expense', category: 'shopping',
    amount: 980_000, description: 'Safety Equipment & PPE',
    date: d(5), recurrence: 'monthly', tags: ['safety'], createdAt: d(5)+'T00:00:00Z', updatedAt: d(5)+'T00:00:00Z',
  },

  // ── EXPENSES — Training & Development ─────────────────────────────────
  {
    id: 'tx-exp-18', accountId: 'acc-payroll', type: 'expense', category: 'education',
    amount: 1_800_000, description: 'Employee Training Programs & Certifications',
    date: d(6), recurrence: 'monthly', tags: ['hr'], createdAt: d(6)+'T00:00:00Z', updatedAt: d(6)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-19', accountId: 'acc-payroll', type: 'expense', category: 'education',
    amount: 940_000, description: 'Leadership & Management Development',
    date: d(12), recurrence: 'monthly', tags: ['hr'], createdAt: d(12)+'T00:00:00Z', updatedAt: d(12)+'T00:00:00Z',
  },

  // ── EXPENSES — Infrastructure & IT ────────────────────────────────────
  {
    id: 'tx-exp-20', accountId: 'acc-operating', type: 'expense', category: 'utilities',
    amount: 1_900_000, description: 'Data Center & Cloud Infrastructure',
    date: d(1), recurrence: 'monthly', tags: ['it'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-21', accountId: 'acc-operating', type: 'expense', category: 'utilities',
    amount: 1_200_000, description: 'Electricity, Gas & Water – All Sites',
    date: d(10), recurrence: 'monthly', tags: ['utilities'], createdAt: d(10)+'T00:00:00Z', updatedAt: d(10)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-22', accountId: 'acc-operating', type: 'expense', category: 'utilities',
    amount: 620_000, description: 'Telecom & Network Infrastructure',
    date: d(1), recurrence: 'monthly', tags: ['it'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },

  // ── EXPENSES — Software & SaaS ────────────────────────────────────────
  {
    id: 'tx-exp-23', accountId: 'acc-operating', type: 'expense', category: 'subscriptions',
    amount: 840_000, description: 'ERP & CRM Platform Licenses',
    date: d(1), recurrence: 'monthly', tags: ['software'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-24', accountId: 'acc-operating', type: 'expense', category: 'subscriptions',
    amount: 520_000, description: 'Productivity Suite & Collaboration Tools',
    date: d(1), recurrence: 'monthly', tags: ['software'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-25', accountId: 'acc-operating', type: 'expense', category: 'subscriptions',
    amount: 380_000, description: 'Cybersecurity & Compliance Subscriptions',
    date: d(1), recurrence: 'monthly', tags: ['security'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },

  // ── EXPENSES — General Operations ─────────────────────────────────────
  {
    id: 'tx-exp-26', accountId: 'acc-operating', type: 'expense', category: 'personal',
    amount: 5_200_000, description: 'Legal, Compliance & Advisory Services',
    date: d(5), recurrence: 'monthly', tags: ['legal'], createdAt: d(5)+'T00:00:00Z', updatedAt: d(5)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-27', accountId: 'acc-operating', type: 'expense', category: 'personal',
    amount: 3_800_000, description: 'Accounting, Audit & Tax Services',
    date: d(5), recurrence: 'monthly', tags: ['finance'], createdAt: d(5)+'T00:00:00Z', updatedAt: d(5)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-28', accountId: 'acc-operating', type: 'expense', category: 'personal',
    amount: 2_100_000, description: 'Insurance Premiums (Commercial & Liability)',
    date: d(1), recurrence: 'monthly', tags: ['insurance'], createdAt: d(1)+'T00:00:00Z', updatedAt: d(1)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-29', accountId: 'acc-operating', type: 'expense', category: 'personal',
    amount: 1_400_000, description: 'Recruitment & HR Services',
    date: d(15), recurrence: 'monthly', tags: ['hr'], createdAt: d(15)+'T00:00:00Z', updatedAt: d(15)+'T00:00:00Z',
  },

  // ── EXPENSES — Contingency Reserve ────────────────────────────────────
  {
    id: 'tx-exp-30', accountId: 'acc-reserve', type: 'expense', category: 'other_expense',
    amount: 1_800_000, description: 'Unplanned Equipment Repairs',
    date: d(22), recurrence: 'none', tags: ['contingency'], createdAt: d(22)+'T00:00:00Z', updatedAt: d(22)+'T00:00:00Z',
  },
  {
    id: 'tx-exp-31', accountId: 'acc-reserve', type: 'expense', category: 'other_expense',
    amount: 680_000, description: 'Emergency Logistics Costs',
    date: d(25), recurrence: 'none', tags: ['contingency'], createdAt: d(25)+'T00:00:00Z', updatedAt: d(25)+'T00:00:00Z',
  },
];

export const sampleCompanyBudget: Partial<AppState> = {
  accounts: sampleAccounts,
  transactions: sampleTransactions,
  budgetLimits: sampleBudgetLimits,
  activePeriod: { month: MONTH, year: YEAR },
};
