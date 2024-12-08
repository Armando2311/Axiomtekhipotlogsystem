import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import Button from './Button';
import { TestLog } from '../types';

interface LogTableProps {
  logs: TestLog[];
  onLogSelect: (log: TestLog) => void;
}

export default function LogTable({ logs, onLogSelect }: LogTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-left">
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Serial Number
            </th>
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Test Date
            </th>
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Operator
            </th>
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Part Number
            </th>
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Status
            </th>
            <th className="px-4 py-2 text-sm font-medium text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b border-gray-800 last:border-0"
            >
              <td className="px-4 py-2">{log.serialNumber}</td>
              <td className="px-4 py-2">
                {format(new Date(log.testDate), 'MMM d, yyyy')}
              </td>
              <td className="px-4 py-2">{log.operator}</td>
              <td className="px-4 py-2">{log.topLevelPartNumber}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    log.status === 'pass'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {log.status.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLogSelect(log)}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}