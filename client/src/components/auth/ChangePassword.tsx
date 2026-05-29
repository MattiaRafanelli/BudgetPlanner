import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useTheme } from '@/context/ThemeContext';
import { AlertCircle } from 'lucide-react';

interface ChangePasswordProps {
  onSuccess: () => void;
  token: string;
}

export function ChangePassword({ onSuccess, token }: ChangePasswordProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Could not change password');
        return;
      }

      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className={`mb-6 p-4 rounded-lg border flex gap-3 ${isDark ? 'bg-gray-700 border-yellow-600' : 'bg-yellow-50 border-yellow-200'}`}>
            <AlertCircle className={`flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} size={20} />
            <div>
              <h2 className={`font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                Password Change Required
              </h2>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                For security, you must change your initial password on first login.
              </p>
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />

            <Input
              type="password"
              placeholder="New Password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />

            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? 'Changing password...' : 'Change Password'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
