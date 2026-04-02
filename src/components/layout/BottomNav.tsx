import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  BarChart3,
  Tag,
} from 'lucide-react';

type Page = 'dashboard' | 'transactions' | 'accounts' | 'budget' | 'reports' | 'categories';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',    label: 'Home',     icon: <LayoutDashboard size={20} /> },
  { id: 'transactions', label: 'Txns',     icon: <ArrowLeftRight size={20} /> },
  { id: 'accounts',     label: 'Accounts', icon: <Wallet size={20} /> },
  { id: 'budget',       label: 'Budget',   icon: <PieChart size={20} /> },
  { id: 'reports',      label: 'Reports',  icon: <BarChart3 size={20} /> },
  { id: 'categories',   label: 'Tags',     icon: <Tag size={20} /> },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                isActive ? 'text-accent-primary' : 'text-text-muted'
              }`}
            >
              <span className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-primary" />
                )}
              </span>
              <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* iOS safe-area spacer */}
      <div className="h-safe-bottom bg-surface" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
