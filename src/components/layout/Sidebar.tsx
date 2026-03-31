import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useBudget } from '@/hooks/useBudget';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={18} /> },
  { id: 'accounts', label: 'Accounts', icon: <Wallet size={18} /> },
  { id: 'budget', label: 'Budget', icon: <PieChart size={18} /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { state, dispatch } = useBudget();
  const { sidebarCollapsed } = state.ui;

  return (
    <aside
      className={`flex flex-col bg-surface border-r border-border transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-border ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-accent-primary flex items-center justify-center shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-sm text-text-primary tracking-wide">
            BudgetPlanner
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full ${
                isActive
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-elevated'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
              {isActive && !sidebarCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-4 border-t border-border">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-elevated transition-all w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
