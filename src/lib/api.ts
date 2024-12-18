export interface PdfLog {
  id?: number;
  workOrderNumber: string;
  operator: string;
  testDate: string;
  serialEntries: Array<{ serialNumber: string }>;
  pdfData: string;
}

// Local development with Nginx
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080' 
  : `http://${window.location.hostname}:8080`;

export const API_BASE_URL = `${API_BASE}/api`;

console.log('Using API URL:', API_BASE_URL); // This will help us debug

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

export async function savePdfLog(log: PdfLog): Promise<{ success: boolean; error?: string; results?: any }> {
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
    console.log('Server response:', data);

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed: Please log in again');
      }
      
      if (response.status === 403) {
        localStorage.removeItem('auth_token');
        throw new Error('Authentication failed: Invalid token');
      }

      throw new Error(data.error || `Server error: ${response.status}`);
    }

    return {
      success: true,
      results: data.results
    };
  } catch (error) {
    console.error('Error saving PDF log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
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

export async function login(username: string, password: string): Promise<string> {
  try {
    console.log('Attempting login with:', { username });
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login successful');
    return data.token;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
