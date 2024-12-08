import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from './Button';

interface TestDefault {
  id: string;
  type: string;
  voltage: string;
  criteria: string;
}

const initialDefaults: TestDefault[] = [
  { id: '1', type: 'HP', voltage: '240V', criteria: '≤ 0.1Ω' },
  { id: '2', type: 'GB', voltage: '120V', criteria: '≤ 0.1Ω' },
];

export default function TestDefaults() {
  const [defaults, setDefaults] = useState<TestDefault[]>(initialDefaults);
  const [showAddDefault, setShowAddDefault] = useState(false);
  const [newDefault, setNewDefault] = useState<Partial<TestDefault>>({
    type: '',
    voltage: '',
    criteria: '',
  });

  const handleAddDefault = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDefault.type && newDefault.voltage && newDefault.criteria) {
      setDefaults((prev) => [
        ...prev,
        { ...newDefault, id: Math.random().toString() } as TestDefault,
      ]);
      setNewDefault({ type: '', voltage: '', criteria: '' });
      setShowAddDefault(false);
    }
  };

  const handleDeleteDefault = (id: string) => {
    setDefaults((prev) => prev.filter((def) => def.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Test Type
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Default Voltage
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Pass Criteria
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {defaults.map((def) => (
              <tr key={def.id} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-2 text-gray-900">{def.type}</td>
                <td className="px-4 py-2 text-gray-900">{def.voltage}</td>
                <td className="px-4 py-2 text-gray-900">{def.criteria}</td>
                <td className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDefault(def.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAddDefault ? (
        <Button onClick={() => setShowAddDefault(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Add Test Default
        </Button>
      ) : (
        <form onSubmit={handleAddDefault} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              value={newDefault.type}
              onChange={(e) =>
                setNewDefault((prev) => ({ ...prev, type: e.target.value }))
              }
              placeholder="Test Type"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            />
            <input
              type="text"
              value={newDefault.voltage}
              onChange={(e) =>
                setNewDefault((prev) => ({ ...prev, voltage: e.target.value }))
              }
              placeholder="Default Voltage"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            />
            <input
              type="text"
              value={newDefault.criteria}
              onChange={(e) =>
                setNewDefault((prev) => ({ ...prev, criteria: e.target.value }))
              }
              placeholder="Pass Criteria"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Add Default</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddDefault(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}