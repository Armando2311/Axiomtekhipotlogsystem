import { X } from 'lucide-react';
import { format } from 'date-fns';
import Button from './Button';
import { TestLog } from '../types';
import { generatePDF } from '../utils/pdfGenerator';

interface LogDetailModalProps {
  log: TestLog;
  onClose: () => void;
}

export default function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const handleDownloadPDF = async () => {
    try {
      const pdf = await generatePDF(log);
      pdf.save(`test-log-${log.serialNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // TODO: Add proper error handling/notification
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-800 bg-gray-900 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-blue-500">Test Log Details</h2>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Serial Number
            </label>
            <p className="text-lg">{log.serialNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Test Date
            </label>
            <p className="text-lg">
              {format(new Date(log.testDate), 'MMMM d, yyyy')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Operator
            </label>
            <p className="text-lg">{log.operator}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Part Number
            </label>
            <p className="text-lg">{log.topLevelPartNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Top Level Serial Number
            </label>
            <p className="text-lg">{log.topLevelSerialNumber}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Status
            </label>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                log.status === 'pass'
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-red-500/20 text-red-500'
              }`}
            >
              {log.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
          <h3 className="mb-4 text-lg font-semibold">Test Results</h3>
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
              {log.results.map((result, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="px-4 py-2">{result.type}</td>
                  <td className="px-4 py-2">{result.voltage}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        result.pass
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {result.pass ? 'PASS' : 'FAIL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownloadPDF}>Download PDF</Button>
        </div>
      </div>
    </div>
  );
}