import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useTheme } from '@/context/ThemeContext';
import { LogOut, Plus, RotateCcw, Lock, Trash2, Check, X, Moon, Sun } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

const UserRow = memo(function UserRow({
  user,
  onToggleActive,
  onResetPassword,
  onAssignPassword,
  onDelete,
  isDark,
}: {
  user: User;
  onToggleActive: (user: User) => void;
  onResetPassword: (user: User) => void;
  onAssignPassword: (user: User) => void;
  onDelete: (userId: string) => void;
  isDark: boolean;
}) {
  return (
    <tr className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'}`}>
      <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {user.username}
      </td>
      <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {user.first_name} {user.last_name}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Badge variant={user.is_active ? 'success' : 'danger'}>
            {user.is_active ? 'Aktiv' : 'Inaktiv'}
          </Badge>
          {user.must_change_password && (
            <Badge variant="warning">Passwort ändern</Badge>
          )}
        </div>
      </td>
      <td className={`px-6 py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {user.last_login
          ? new Date(user.last_login).toLocaleDateString('de-DE')
          : 'Nie'}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={user.is_active ? 'secondary' : 'primary'}
            onClick={() => onToggleActive(user)}
            className="flex items-center gap-1"
          >
            {user.is_active ? <X size={14} /> : <Check size={14} />}
            {user.is_active ? 'Deaktivieren' : 'Aktivieren'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onResetPassword(user)}
            className="flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(user.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} />
            Löschen
          </Button>
        </div>
      </td>
    </tr>
  );
});

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Load users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/users', { headers });

      if (!response.ok) {
        setError('Failed to load users');
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username) {
      setError('Benutzername ist erforderlich');
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setError('Vorname und Nachname sind erforderlich');
      return;
    }

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Benutzer konnte nicht erstellt werden');
        return;
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword);
      setSuccess('Benutzer erstellt! Teilen Sie das temporäre Passwort sicher mit.');
      setFormData({ username: '', firstName: '', lastName: '' });

      // Reload users
      setTimeout(() => {
        fetchUsers();
        setShowCreateModal(false);
      }, 2000);
    } catch (err) {
      setError('Verbindungsfehler');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/auth/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        setError('Failed to reset password');
        return;
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword);
      setSuccess('Password reset! Share the temporary password securely.');

      setTimeout(() => {
        fetchUsers();
        setShowResetModal(false);
      }, 2000);
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        setError('Failed to delete user');
        return;
      }

      setSuccess('User deleted');
      fetchUsers();
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isActive: !user.is_active }),
      });

      if (!response.ok) {
        setError('Failed to update user');
        return;
      }

      fetchUsers();
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header with dark mode support */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            👨‍💼 Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleTheme()}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isDark ? 'Hellmodus' : 'Dunkelmodus'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button onClick={onLogout} variant="secondary" className="flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Stats Cards */}
        <div className={`${isDark ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-lg p-6 mb-8 border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Benutzerverwaltung
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {users.length}
              </div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Gesamtbenutzer</p>
            </div>
            <div>
              <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {users.filter((u) => u.is_active).length}
              </div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Aktive Benutzer</p>
            </div>
            <div>
              <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {users.filter((u) => u.must_change_password).length}
              </div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Passwort ändern</p>
            </div>
          </div>
        </div>

        {/* Create User Button */}
        <div className="mb-6">
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Neuen Benutzer erstellen
          </Button>
        </div>

        {/* Users Table */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
          {loading ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Benutzer werden geladen...
            </div>
          ) : users.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Keine Benutzer gefunden
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Benutzername
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Letzter Login
                    </th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isDark={isDark}
                      onToggleActive={handleToggleActive}
                      onResetPassword={(u) => {
                        setSelectedUser(u);
                        setShowResetModal(true);
                      }}
                      onAssignPassword={(u) => {
                        setSelectedUser(u);
                        // TODO: Show assign password modal
                      }}
                      onDelete={handleDeleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Neuen Benutzer erstellen"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            type="text"
            placeholder="Benutzername"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />

          <Input
            type="text"
            placeholder="Vorname"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />

          <Input
            type="text"
            placeholder="Nachname"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />

          {tempPassword && (
            <div className={`p-3 rounded ${isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Temporäres Passwort: <span className="font-bold">{tempPassword}</span>
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Teilen Sie dies sicher mit dem Benutzer. Er muss es beim ersten Login ändern.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit">Benutzer erstellen</Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title={`Passwort zurücksetzen für ${selectedUser?.username}`}
      >
        <div className="space-y-4">
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Passwort für <strong>{selectedUser?.username}</strong> zurücksetzen? Ein neues temporäres Passwort wird generiert.
          </p>

          {tempPassword && (
            <div className={`p-3 rounded ${isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                Neues temporäres Passwort: <span className="font-bold">{tempPassword}</span>
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Teilen Sie dies sicher mit dem Benutzer. Er muss es ändern.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResetModal(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={!!tempPassword}
            >
              {tempPassword ? 'Passwort zurückgesetzt' : 'Passwort zurücksetzen'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
