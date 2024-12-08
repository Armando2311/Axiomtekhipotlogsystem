export interface PdfLog {
  id?: number;
  workOrderNumber: string;
  operator: string;
  testDate: string;
  serialEntries: Array<{ serialNumber: string }>;
  pdfData: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function savePdfLog(log: PdfLog): Promise<PdfLog> {
  try {
    console.log('Sending PDF log to server:', {
      workOrderNumber: log.workOrderNumber,
      operator: log.operator,
      testDate: log.testDate,
      serialCount: log.serialEntries?.length,
      pdfDataLength: log.pdfData?.length
    });

    const response = await fetch(`${API_BASE_URL}/logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(log),
    });

    const data = await response.json();

    if (!response.ok) {
      // Only clear token for specific authentication errors
      if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed: Token expired');
      }
      
      if (response.status === 403 && data.code === 'INVALID_TOKEN') {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed: Invalid token');
      }

      throw new Error(`Failed to save PDF log: ${response.status} - ${JSON.stringify(data)}`);
    }

    console.log('Successfully saved PDF log:', {
      success: data.success,
      results: data.results
    });
    return data;
  } catch (error) {
    console.error('Error saving PDF log:', error);
    throw error;
  }
}

export async function getAllPdfLogs(): Promise<PdfLog[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status}`);
    }

    const data = await response.json();
    return data.logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
}

export async function deleteLog(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/logs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete log');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
  }
}
