import { Check, X } from 'lucide-react';
import { TestResult } from '../types';

interface TestResultsTableProps {
  results: TestResult[];
  onResultsChange: (results: TestResult[]) => void;
}

export default function TestResultsTable({
  results,
  onResultsChange,
}: TestResultsTableProps) {
  const handleVoltageChange = (index: number, value: string) => {
    onResultsChange(
      results.map((result, i) =>
        i === index ? { ...result, voltage: value } : result
      )
    );
  };

  const handlePassChange = (index: number, pass: boolean) => {
    onResultsChange(
      results.map((result, i) =>
        i === index ? { ...result, pass } : result
      )
    );
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">Test Results</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-2 text-sm font-medium text-gray-400">
                Test Type
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-400">
                Voltage
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-400">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={index}
                className="border-b border-gray-800 last:border-0"
              >
                <td className="px-4 py-2">{result.type}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={result.voltage}
                    onChange={(e) =>
                      handleVoltageChange(index, e.target.value)
                    }
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-1 text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter voltage"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePassChange(index, true)}
                      className={`rounded-md p-1 transition-colors ${
                        result.pass === true
                          ? 'bg-green-500/20 text-green-500'
                          : 'text-gray-500 hover:text-green-500'
                      }`}
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePassChange(index, false)}
                      className={`rounded-md p-1 transition-colors ${
                        result.pass === false
                          ? 'bg-red-500/20 text-red-500'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}