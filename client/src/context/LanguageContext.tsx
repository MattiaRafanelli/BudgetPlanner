import { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'en' | 'it';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  de: {
    // TopBar
    'topbar.logout': 'Abmelden',
    'topbar.lightMode': 'Hellmodus',
    'topbar.darkMode': 'Dunkelmodus',
    'topbar.addTransaction': 'Transaktion hinzufügen',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transaktionen',
    'nav.accounts': 'Konten',
    'nav.budget': 'Budget',
    'nav.reports': 'Berichte',
    'nav.categories': 'Kategorien',
    'nav.calendar': 'Kalender',
    
    // Accounts
    'accounts.title': 'Konten',
    'accounts.noAccounts': 'Keine Konten vorhanden',
    'accounts.addButton': 'Konto hinzufügen',
    'accounts.newAccount': 'Neues Konto',
    'accounts.accountName': 'Kontoname',
    'accounts.type': 'Typ',
    'accounts.currency': 'Währung',
    'accounts.initialBalance': 'Anfänglicher Saldo',
    'accounts.color': 'Farbe',
    'accounts.cancel': 'Abbrechen',
    'accounts.add': 'Hinzufügen',
    'accounts.currentBalance': 'Aktueller Saldo',
    'accounts.income': 'Einnahmen',
    'accounts.expenses': 'Ausgaben',
    
    // Transactions
    'transactions.title': 'Transaktionen',
    'transactions.add': 'Transaktion hinzufügen',
    'transactions.edit': 'Bearbeiten',
    'transactions.delete': 'Löschen',
    'transactions.amount': 'Betrag',
    'transactions.category': 'Kategorie',
    'transactions.description': 'Beschreibung',
    'transactions.date': 'Datum',
    'transactions.noTransactions': 'Keine Transaktionen',
    
    // Budget
    'budget.title': 'Budget',
    'budget.monthlyLimit': 'Monatliches Limit',
    'budget.set': 'Festlegen',
    'budget.update': 'Aktualisieren',
    
    // Categories
    'categories.title': 'Kategorien',
    'categories.addButton': 'Kategorie hinzufügen',
    'categories.name': 'Name',
    'categories.icon': 'Symbol',
    
    // Reports
    'reports.title': 'Berichte',
    'reports.spending': 'Ausgaben',
    'reports.income': 'Einnahmen',
    
    // Calendar
    'calendar.title': 'Kalender',
    
    // General
    'general.save': 'Speichern',
    'general.cancel': 'Abbrechen',
    'general.delete': 'Löschen',
    'general.edit': 'Bearbeiten',
    'general.close': 'Schließen',
    'general.loading': 'Wird geladen...',
    'general.error': 'Fehler',
    'general.success': 'Erfolgreich',
  },
  en: {
    // TopBar
    'topbar.logout': 'Logout',
    'topbar.lightMode': 'Light Mode',
    'topbar.darkMode': 'Dark Mode',
    'topbar.addTransaction': 'Add Transaction',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.accounts': 'Accounts',
    'nav.budget': 'Budget',
    'nav.reports': 'Reports',
    'nav.categories': 'Categories',
    'nav.calendar': 'Calendar',
    
    // Accounts
    'accounts.title': 'Accounts',
    'accounts.noAccounts': 'No accounts yet',
    'accounts.addButton': 'Add Account',
    'accounts.newAccount': 'New Account',
    'accounts.accountName': 'Account Name',
    'accounts.type': 'Type',
    'accounts.currency': 'Currency',
    'accounts.initialBalance': 'Initial Balance',
    'accounts.color': 'Color',
    'accounts.cancel': 'Cancel',
    'accounts.add': 'Add',
    'accounts.currentBalance': 'Current Balance',
    'accounts.income': 'Income',
    'accounts.expenses': 'Expenses',
    
    // Transactions
    'transactions.title': 'Transactions',
    'transactions.add': 'Add Transaction',
    'transactions.edit': 'Edit',
    'transactions.delete': 'Delete',
    'transactions.amount': 'Amount',
    'transactions.category': 'Category',
    'transactions.description': 'Description',
    'transactions.date': 'Date',
    'transactions.noTransactions': 'No transactions',
    
    // Budget
    'budget.title': 'Budget',
    'budget.monthlyLimit': 'Monthly Limit',
    'budget.set': 'Set',
    'budget.update': 'Update',
    
    // Categories
    'categories.title': 'Categories',
    'categories.addButton': 'Add Category',
    'categories.name': 'Name',
    'categories.icon': 'Icon',
    
    // Reports
    'reports.title': 'Reports',
    'reports.spending': 'Spending',
    'reports.income': 'Income',
    
    // Calendar
    'calendar.title': 'Calendar',
    
    // General
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.close': 'Close',
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
  },
  it: {
    // TopBar
    'topbar.logout': 'Esci',
    'topbar.lightMode': 'Modalità chiara',
    'topbar.darkMode': 'Modalità scura',
    'topbar.addTransaction': 'Aggiungi transazione',
    
    // Navigation
    'nav.dashboard': 'Pannello di controllo',
    'nav.transactions': 'Transazioni',
    'nav.accounts': 'Conti',
    'nav.budget': 'Budget',
    'nav.reports': 'Rapporti',
    'nav.categories': 'Categorie',
    'nav.calendar': 'Calendario',
    
    // Accounts
    'accounts.title': 'Conti',
    'accounts.noAccounts': 'Nessun conto ancora',
    'accounts.addButton': 'Aggiungi conto',
    'accounts.newAccount': 'Nuovo conto',
    'accounts.accountName': 'Nome conto',
    'accounts.type': 'Tipo',
    'accounts.currency': 'Valuta',
    'accounts.initialBalance': 'Saldo iniziale',
    'accounts.color': 'Colore',
    'accounts.cancel': 'Annulla',
    'accounts.add': 'Aggiungi',
    'accounts.currentBalance': 'Saldo attuale',
    'accounts.income': 'Reddito',
    'accounts.expenses': 'Spese',
    
    // Transactions
    'transactions.title': 'Transazioni',
    'transactions.add': 'Aggiungi transazione',
    'transactions.edit': 'Modifica',
    'transactions.delete': 'Elimina',
    'transactions.amount': 'Importo',
    'transactions.category': 'Categoria',
    'transactions.description': 'Descrizione',
    'transactions.date': 'Data',
    'transactions.noTransactions': 'Nessuna transazione',
    
    // Budget
    'budget.title': 'Budget',
    'budget.monthlyLimit': 'Limite mensile',
    'budget.set': 'Imposta',
    'budget.update': 'Aggiorna',
    
    // Categories
    'categories.title': 'Categorie',
    'categories.addButton': 'Aggiungi categoria',
    'categories.name': 'Nome',
    'categories.icon': 'Icona',
    
    // Reports
    'reports.title': 'Rapporti',
    'reports.spending': 'Spese',
    'reports.income': 'Reddito',
    
    // Calendar
    'calendar.title': 'Calendario',
    
    // General
    'general.save': 'Salva',
    'general.cancel': 'Annulla',
    'general.delete': 'Elimina',
    'general.edit': 'Modifica',
    'general.close': 'Chiudi',
    'general.loading': 'Caricamento in corso...',
    'general.error': 'Errore',
    'general.success': 'Successo',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored && ['de', 'en', 'it'].includes(stored)) return stored;
    
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'de') return 'de';
    if (browserLang === 'it') return 'it';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
