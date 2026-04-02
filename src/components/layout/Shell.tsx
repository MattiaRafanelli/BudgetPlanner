import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports' | 'categories';

interface ShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export function Shell({ currentPage, onNavigate, children }: ShellProps) {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}
