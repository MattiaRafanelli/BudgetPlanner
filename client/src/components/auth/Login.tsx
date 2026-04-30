import { useState, useCallback, memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useTheme } from '@/context/ThemeContext';
import { Mail, Lock, Moon, Sun } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export const Login = memo(function Login({ onLogin }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login fehlgeschlagen');
        return;
      }

      const data = await response.json();
      onLogin(data.token, data.user);
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-2 rounded-full transition-colors duration-300 ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
            : 'bg-white hover:bg-gray-100 text-gray-800 shadow-md'
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="w-full max-w-md px-4">
        <Card className={`shadow-2xl border-0 ${
          isDark
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900'
        }`}>
          <div className="p-8">
            {/* Logo/Header */}
            <div className="mb-8 text-center">
              <div className={`inline-flex p-3 rounded-full mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-blue-100'
              }`}>
                <Mail size={24} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Budget Planner
              </h1>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Verwalte dein Budget intelligent
              </p>
            </div>

            {error && (
              <Alert variant="error" className="mb-6">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="relative">
                <div className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Mail size={20} />
                </div>
                <Input
                  type="text"
                  placeholder="Benutzername oder Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className={`pl-10 h-12 text-base ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <div className={`absolute left-3 top-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Lock size={20} />
                </div>
                <Input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`pl-10 h-12 text-base ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading || !username || !password}
                className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300'
                } text-white`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Anmelden...
                  </span>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>

            {/* Info text */}
            <p className={`text-xs text-center mt-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Sichere Anmeldung • Verschlüsselte Verbindung
            </p>
          </div>
        </Card>

        {/* Footer info */}
        <div className={`text-center mt-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          <p>© 2024 Budget Planner. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';
