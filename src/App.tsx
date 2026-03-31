import React, { useState } from 'react';
import { BudgetProvider } from '@/context/BudgetContext';
import { Shell } from '@/components/layout/Shell';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Accounts } from '@/pages/Accounts';
import { Budget } from '@/pages/Budget';
import { Reports } from '@/pages/Reports';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={(p) => setCurrentPage(p as Page)} />;
      case 'transactions':
        return <Transactions />;
      case 'accounts':
        return <Accounts />;
      case 'budget':
        return <Budget />;
      case 'reports':
        return <Reports />;
    }
  };

  return (
    <Shell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Shell>
  );
}

export default function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
}
