import { useState, useEffect } from 'react';
import { Search, FileText, Filter, Download, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { deleteLog, API_BASE_URL } from '../lib/api';

interface PdfLog {
  id: number;
  serial_number: string;
  work_order_number: string;
  operator: string;
  test_date: string;
  pdf_data: string;
  created_at: string;
}

export default function LogsView() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<PdfLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching logs with token...');
      
      const response = await fetch(`${API_BASE_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received logs:', data);
      
      if (data.success) {
        setLogs(data.logs || []);
      } else {
        throw new Error(data.error || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (pdfData: string | null) => {
    if (!pdfData) {
      alert('No PDF data available');
      return;
    }

    try {
      // Open PDF in a new tab
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(
          '<iframe width="100%" height="100%" src="' + pdfData + '"></iframe>'
        );
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Error opening PDF. Please try again.');
    }
  };

  const handleDownloadPDF = (log: PdfLog) => {
    if (!log.pdf_data) {
      alert('No PDF data available');
      return;
    }

    try {
      // Create a link to download the PDF
      const link = document.createElement('a');
      link.href = log.pdf_data;
      link.download = `work-order-${log.work_order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await deleteLog(id);
      if (success) {
        setLogs(logs.filter(log => log.id !== id));
      }
    } catch (err) {
      console.error('Error deleting log:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]); // Re-fetch when token changes

  const filteredLogs = logs.filter((log) => {
    const searchString = searchQuery.toLowerCase();
    return (
      log.work_order_number.toLowerCase().includes(searchString) ||
      log.operator.toLowerCase().includes(searchString) ||
      log.serial_number.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-axiom-500">Test Logs</h1>
        <div className="space-x-4">
          <Button onClick={fetchLogs}>Refresh</Button>
          <Button href="/new-test">New Work Order</Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by work order, operator, or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center text-gray-600">
            {searchQuery ? 'No matching logs found.' : 'No logs available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Work Order
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Test Date
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      {log.work_order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      {log.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      {format(new Date(log.test_date), 'MM/dd/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      {log.serial_number}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPDF(log.pdf_data)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View PDF"
                          disabled={!log.pdf_data}
                        >
                          <FileText size={20} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(log)}
                          className="text-green-600 hover:text-green-800"
                          title="Download PDF"
                          disabled={!log.pdf_data}
                        >
                          <Download size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Log"
                          disabled={loading}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}