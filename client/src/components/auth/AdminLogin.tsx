import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface AdminLoginProps {
  onLogin: (token: string, admin: any) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        setError(data.error || 'Login failed');
        return;
      }

      const data = await response.json();
      onLogin(data.token, data.admin);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
          <p className="text-gray-600 mb-6">Budget Planner Administration</p>

          {error && <Alert variant="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Default username: <strong>admin</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}
