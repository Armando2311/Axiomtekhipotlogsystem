import { WorkOrder } from '../types';
import { savePdfLog } from '../lib/api';

export async function savePdfToDatabase(workOrder: WorkOrder, pdfData: string) {
  try {
    console.log('Saving work order to database:', {
      workOrderNumber: workOrder.workOrderNumber,
      operator: workOrder.operator,
      testDate: workOrder.testDate,
      serialCount: workOrder.serialEntries.length
    });

    const response = await savePdfLog({
      workOrderNumber: workOrder.workOrderNumber,
      operator: workOrder.operator,
      testDate: workOrder.testDate,
      serialEntries: workOrder.serialEntries,
      pdfData: pdfData
    });

    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to save work order');
    }

    console.log('Successfully saved work order:', response);
    return response;
  } catch (error) {
    console.error('Error saving PDF to database:', error);
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw error;
    }
    throw new Error('Failed to save work order');
  }
}
