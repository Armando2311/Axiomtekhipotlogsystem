import { useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import Button from './Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'technician';
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'supervisor',
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'technician',
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.email && newUser.role) {
      setUsers((prev) => [
        ...prev,
        { ...newUser, id: Math.random().toString() } as User,
      ]);
      setNewUser({ name: '', email: '', role: 'technician' });
      setShowAddUser(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Email
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Role
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-2 text-gray-900">{user.name}</td>
                <td className="px-4 py-2 text-gray-900">{user.email}</td>
                <td className="px-4 py-2 text-gray-900">
                  <span className="capitalize">{user.role}</span>
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAddUser ? (
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="mr-2 h-5 w-5" />
          Add User
        </Button>
      ) : (
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              value={newUser.name}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            />
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser((prev) => ({
                  ...prev,
                  role: e.target.value as User['role'],
                }))
              }
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            >
              <option value="technician">Technician</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add User</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddUser(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}