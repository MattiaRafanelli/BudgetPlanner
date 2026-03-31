import React from 'react';
import { Sidebar } from './Sidebar';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports';

interface ShellProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export function Shell({ currentPage, onNavigate, children }: ShellProps) {
  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
