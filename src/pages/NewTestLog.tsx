import { useState } from 'react';
import { format } from 'date-fns';
import { Save, Scan, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { generatePDF } from '../utils/pdfGenerator';
import { savePdfToDatabase } from '../utils/savePdf';
import { WorkOrder, SerialEntry } from '../types';

const DEFAULT_TEST_RESULTS = {
  ps1: {
    hp: 'P' as const,
    gb: 'P' as const,
    operational: 'P' as const,
  },
  ps2: {
    hp: 'P' as const,
    gb: 'P' as const,
    operational: 'P' as const,
  },
};

export default function NewTestLog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    workOrderNumber: '',
    operator: 'Default Operator',  
    partNumber: '',
    testDate: format(new Date(), 'yyyy-MM-dd'),
    testVoltage: '240V',
  });

  const [serialEntries, setSerialEntries] = useState<SerialEntry[]>([
    { serialNumber: '', testResults: DEFAULT_TEST_RESULTS },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSerialNumberChange = (index: number, value: string) => {
    setSerialEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, serialNumber: value } : entry
      )
    );
  };

  const addSerialEntry = () => {
    if (serialEntries.length < 10) {
      setSerialEntries((prev) => [
        ...prev,
        { serialNumber: '', testResults: DEFAULT_TEST_RESULTS },
      ]);
    }
  };

  const removeSerialEntry = (index: number) => {
    if (serialEntries.length > 1) {
      setSerialEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Filter out empty serial entries
      const validEntries = serialEntries.filter(entry => entry.serialNumber.trim());
      
      if (validEntries.length === 0) {
        alert('Please enter at least one serial number.');
        return;
      }

      const workOrder: WorkOrder = {
        ...formData,
        serialEntries: validEntries,
      };

      // Generate PDF and convert to base64
      const pdf = await generatePDF(workOrder);
      const pdfBlob = pdf.output('blob');
      
      const pdfData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pdfBlob);
      });

      // Save to database
      const success = await savePdfToDatabase(workOrder, pdfData);

      if (!success) {
        throw new Error('Failed to save work order');
      }

      navigate('/logs');
    } catch (error) {
      console.error('Error saving work order:', error);
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Error saving work order. Please try again.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-axiom-500">New Work Order</h1>
        <p className="text-gray-600">
          Create a new work order by entering the details and scanning serial numbers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-axiom-500">Work Order Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="workOrderNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Work Order Number
              </label>
              <input
                type="text"
                id="workOrderNumber"
                name="workOrderNumber"
                value={formData.workOrderNumber}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="operator"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Operator
              </label>
              <input
                type="text"
                id="operator"
                name="operator"
                value={formData.operator}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="partNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Part Number
              </label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                value={formData.partNumber}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="testDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Test Date
              </label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                required
              />
            </div>

            <div>
              <label
                htmlFor="testVoltage"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Test Voltage
              </label>
              <input
                type="text"
                id="testVoltage"
                name="testVoltage"
                value={formData.testVoltage}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                required
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-axiom-500">Serial Numbers</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSerialEntry}
              disabled={serialEntries.length >= 10}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Serial Number
            </Button>
          </div>

          <div className="space-y-4">
            {serialEntries.map((entry, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={entry.serialNumber}
                    onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-axiom-500 focus:outline-none focus:ring-2 focus:ring-axiom-500/20"
                    placeholder="Enter serial number"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSerialNumberChange(index, '')}
                >
                  <Scan className="h-4 w-4" />
                </Button>
                {serialEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSerialEntry(index)}
                  >
                    <Minus className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-5 w-5" />
            Save Work Order
          </Button>
        </div>
      </form>
    </div>
  );
}