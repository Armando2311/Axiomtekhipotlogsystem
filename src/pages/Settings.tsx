import { useState, useEffect } from 'react';
import { Plus, Users, Save, Upload } from 'lucide-react';
import Button from '../components/Button';
import SettingsSection from '../components/SettingsSection';
import UserManagement from '../components/UserManagement';
import TestDefaults from '../components/TestDefaults';
import { API_BASE_URL } from '../lib/api';

interface Operator {
  username: string;
  is_admin: boolean;
  created_at: string;
}

export default function Settings() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [newOperator, setNewOperator] = useState({
    username: '',
    password: '',
    is_admin: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState({
    testFails: true,
    testCompleted: false,
  });

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/operators`, {
        headers: {
          'X-Operator': localStorage.getItem('operator') || '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOperators(data);
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    }
  };

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/operators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Operator': localStorage.getItem('operator') || '',
        },
        body: JSON.stringify(newOperator),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Operator added successfully');
        setNewOperator({ username: '', password: '', is_admin: false });
        fetchOperators();
      } else {
        setError(data.message || 'Failed to add operator');
      }
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    console.log('Saving settings...');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-axiom-600 mb-2">Settings</h1>
        <p className="text-gray-600">Manage operators and system settings</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Add New Operator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="h-5 w-5 text-axiom-500" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Operator</h2>
          </div>

          <form onSubmit={handleAddOperator} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-axiom-500"
                value={newOperator.username}
                onChange={(e) => setNewOperator(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-axiom-500"
                value={newOperator.password}
                onChange={(e) => setNewOperator(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_admin"
                className="rounded border-gray-300 text-axiom-600 focus:ring-axiom-500"
                checked={newOperator.is_admin}
                onChange={(e) => setNewOperator(prev => ({ ...prev, is_admin: e.target.checked }))}
              />
              <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
                Admin privileges
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <Button type="submit">
              Add Operator
            </Button>
          </form>
        </div>

        {/* Operators List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-axiom-500" />
            <h2 className="text-xl font-semibold text-gray-900">Current Operators</h2>
          </div>

          <div className="space-y-4">
            {operators.map((operator) => (
              <div
                key={operator.username}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{operator.username}</div>
                  <div className="text-sm text-gray-500">
                    {operator.is_admin ? 'Administrator' : 'Operator'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(operator.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Branding */}
        <SettingsSection title="Company Branding">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Logo
              </label>
              <div className="flex items-start gap-4">
                {logo ? (
                  <img
                    src={logo}
                    alt="Company logo"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-contain p-2"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-gray-200 bg-white">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById('logo')?.click()}
                  >
                    Upload Logo
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    Recommended size: 200x200px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.testFails}
                onChange={(e) =>
                  setEmailNotifications((prev) => ({
                    ...prev,
                    testFails: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-axiom-500 focus:ring-2 focus:ring-axiom-500/20"
              />
              <span className="text-sm text-gray-700">Notify when test fails</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNotifications.testCompleted}
                onChange={(e) =>
                  setEmailNotifications((prev) => ({
                    ...prev,
                    testCompleted: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-axiom-500 focus:ring-2 focus:ring-axiom-500/20"
              />
              <span className="text-sm text-gray-700">
                Notify when test is completed
              </span>
            </label>
          </div>
        </SettingsSection>

        {/* User Management */}
        <SettingsSection title="User Management" fullWidth>
          <UserManagement />
        </SettingsSection>

        {/* Test Defaults */}
        <SettingsSection title="Test Defaults" fullWidth>
          <TestDefaults />
        </SettingsSection>
      </div>

      <Button onClick={handleSaveSettings}>
        <Save className="mr-2 h-5 w-5" />
        Save Changes
      </Button>
    </div>
  );
}