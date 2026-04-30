import { useState, useEffect } from 'react';
import { BudgetProvider } from '@/context/BudgetContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';
import { Shell } from '@/components/layout/Shell';
import { Login } from '@/components/auth/Login';
import { AdminDashboard } from '@/components/auth/AdminDashboard';
import { ChangePassword } from '@/components/auth/ChangePassword';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Accounts } from '@/pages/Accounts';
import { Budget } from '@/pages/Budget';
import { Reports } from '@/pages/Reports';
import { Categories } from '@/pages/Categories';
import { Calendar } from '@/pages/Calendar';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports' | 'categories' | 'calendar';
type UserRole = 'admin' | 'user';

interface UserSession {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    mustChangePassword: boolean;
  };
}

function AppContent({ onLogout }: { onLogout: () => void }) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard onNavigate={(p) => setCurrentPage(p as Page)} />;
      case 'transactions': return <Transactions />;
      case 'accounts':     return <Accounts />;
      case 'budget':       return <Budget />;
      case 'reports':      return <Reports />;
      case 'categories':   return <Categories />;
      case 'calendar':     return <Calendar />;
    }
  };

  return (
    <Shell currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout}>
      {renderPage()}
    </Shell>
  );
}

function AppInner() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  // Check for stored session on mount (use sessionStorage - cleared on browser close)
  useEffect(() => {
    const stored = sessionStorage.getItem('userSession');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setUserSession(session);
        if (session.user.mustChangePassword) {
          setPasswordChangeRequired(true);
        }
      } catch (error) {
        sessionStorage.removeItem('userSession');
      }
    }
  }, []);

  const handleLogin = (token: string, user: any) => {
    const session = { token, user };
    setUserSession(session);
    // Use sessionStorage - cleared when browser closes
    sessionStorage.setItem('userSession', JSON.stringify(session));

    if (user.mustChangePassword) {
      setPasswordChangeRequired(true);
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    setPasswordChangeRequired(false);
    sessionStorage.removeItem('userSession');
  };

  const handlePasswordChanged = () => {
    setPasswordChangeRequired(false);
    if (userSession) {
      const updated = {
        ...userSession,
        user: { ...userSession.user, mustChangePassword: false },
      };
      setUserSession(updated);
      sessionStorage.setItem('userSession', JSON.stringify(updated));
    }
  };

  // Login view
  if (!userSession) {
    return <Login onLogin={handleLogin} />;
  }

  // Password change required view
  if (passwordChangeRequired && userSession) {
    return (
      <ChangePassword
        token={userSession.token}
        onSuccess={handlePasswordChanged}
      />
    );
  }

  // Admin dashboard
  if (userSession.user.role === 'admin') {
    return (
      <AdminDashboard token={userSession.token} onLogout={handleLogout} />
    );
  }

  // Regular user app
  return (
    <UserProvider onLogout={handleLogout}>
      <BudgetProvider>
        <AppContent onLogout={handleLogout} />
      </BudgetProvider>
    </UserProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
