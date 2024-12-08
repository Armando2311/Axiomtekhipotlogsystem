export interface SerialEntry {
  serialNumber: string;
  testResults: {
    ps1: {
      hp: 'P' | 'F' | 'NA';
      gb: 'P' | 'F' | 'NA';
      operational: 'P' | 'F' | 'NA';
    };
    ps2: {
      hp: 'P' | 'F' | 'NA';
      gb: 'P' | 'F' | 'NA';
      operational: 'P' | 'F' | 'NA';
    };
  };
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  operator: string;
  partNumber: string;
  testDate: string;
  testVoltage: string;
  serialEntries: SerialEntry[];
  pdfData?: string; // Base64 encoded PDF data
}

export interface TestLog {
  id: string;
  serialNumber: string;
  operator: string;
  topLevelPartNumber: string;
  testDate: string;
  topLevelSerialNumber: string;
  status: 'pass' | 'fail';
  results: Array<{
    type: string;
    voltage: string;
    pass: boolean;
  }>;
  pdfData?: string; // Base64 encoded PDF data
}