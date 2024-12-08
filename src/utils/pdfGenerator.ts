import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { WorkOrder } from '../types';

export async function generatePDF(workOrder: WorkOrder) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Set up fonts and colors
  pdf.setFont('helvetica');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  // Define table structure
  const columnWidths = {
    date: 30,
    operator: 35,
    partNumber: 40,
    serialNumber: 45,
    voltage: 25,
    testType: 45,
    results: 50,
  };

  // Header row
  let yPos = 20;
  let xPos = 10;

  // Headers
  const headers = [
    'Date',
    'Operator',
    'Top Level PN*',
    'Top Level SN*',
    'Test Voltage',
    'Test Type',
    'Results',
  ];

  // Draw table headers
  headers.forEach((header, index) => {
    const width = Object.values(columnWidths)[index];
    pdf.rect(xPos, yPos, width, 8);
    pdf.text(header, xPos + 2, yPos + 5);
    xPos += width;
  });

  // Draw entries
  workOrder.serialEntries.forEach((entry, index) => {
    yPos += 8;
    xPos = 10;

    // Common data
    const rowData = [
      format(new Date(workOrder.testDate), 'MM/dd/yyyy'),
      workOrder.operator,
      workOrder.partNumber,
      entry.serialNumber,
      workOrder.testVoltage,
      'PS1: HP GB\nPS2: HP GB',
      'PS1: ✓ PASSED\nPS2: ✓ PASSED',
    ];

    rowData.forEach((data, colIndex) => {
      const width = Object.values(columnWidths)[colIndex];
      pdf.rect(xPos, yPos, width, 16); // Increased height for two lines
      
      if (data.includes('\n')) {
        const lines = data.split('\n');
        // Set color to green for checkmarks in the results column
        if (colIndex === 6) {
          pdf.setTextColor(34, 197, 94); // Green color
        }
        pdf.text(lines[0], xPos + 2, yPos + 5);
        pdf.text(lines[1], xPos + 2, yPos + 13);
        pdf.setTextColor(0, 0, 0); // Reset to black
      } else {
        pdf.text(data, xPos + 2, yPos + 9); // Centered vertically in the taller cell
      }
      xPos += width;
    });
    yPos += 8; // Additional height for the dual power supply rows
  });

  // Add footer with legends
  const footerY = pdf.internal.pageSize.height - 20;
  pdf.setFontSize(8);
  pdf.text('* As shown on unit', 10, footerY);
  pdf.text('** HP = Hi-Pot, GB = Ground Bond, PS1/PS2 = Power Supply 1/2', 10, footerY + 5);

  return pdf;
}