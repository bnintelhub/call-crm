import * as XLSX from 'xlsx';
import { allocationRowSchema, type AllocationRowData } from './allocationDataMapping';
import * as idb from 'idb-keyval';

export interface ProcessResult {
  total: number;
  successCount: number;
  failedCount: number;
  errors: { row: number; reason: string; data: any }[];
  successfulRows: AllocationRowData[];
}

export const extractHeadersAndData = async (file: File): Promise<{ headers: string[], rawData: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
        
        if (rawData.length === 0) {
          resolve({ headers: [], rawData: [] });
          return;
        }

        // Extract headers from the first row object keys
        const headers = Object.keys(rawData[0]);
        resolve({ headers, rawData });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const processMappedData = async (
  rawData: any[],
  mapping: Record<string, string>,
  allocationId: string,
  onProgress?: (progress: number) => void
): Promise<ProcessResult> => {
  const successfulRows: AllocationRowData[] = [];
  const errors: { row: number; reason: string; data: any }[] = [];

  const chunkSize = 1000;

  for (let i = 0; i < rawData.length; i += chunkSize) {
    const chunk = rawData.slice(i, i + chunkSize);
    
    for (let j = 0; j < chunk.length; j++) {
      const row = chunk[j];
      const rowIndex = i + j;
      
      const mappedRow: any = {
        batch_id: allocationId
      };
      
      for (const [sysKey, fileHeader] of Object.entries(mapping)) {
        if (fileHeader && row[fileHeader] !== undefined) {
          mappedRow[sysKey] = row[fileHeader];
        }
      }

      const result = allocationRowSchema.safeParse(mappedRow);
      if (result.success) {
        successfulRows.push(result.data);
      } else {
        const issues = result.error?.issues || [];
        const firstError = issues[0];
        const reason = firstError 
          ? `${firstError.path?.join('.') || 'row'}: ${firstError.message}` 
          : 'Validation failed';
        errors.push({ row: rowIndex + 2, reason, data: row }); 
      }
    }
    
    // Yield to main thread to prevent UI freeze
    await new Promise(resolve => setTimeout(resolve, 0));
    
    if (onProgress) {
      onProgress(Math.min(100, Math.round(((i + chunk.length) / rawData.length) * 100)));
    }
  }

  if (successfulRows.length > 0) {
    try {
      await idb.set(`allocation_data_${allocationId}`, successfulRows);
    } catch (err) {
      console.error("Failed to save to IndexedDB", err);
      throw new Error("Failed to save data to local database. The file might be too large or the browser storage is full.");
    }
  }

  return {
    total: rawData.length,
    successCount: successfulRows.length,
    failedCount: errors.length,
    errors,
    successfulRows,
  };
};

export const generateErrorReport = (errors: { row: number; reason: string; data: any }[], originalFileName: string) => {
  if (errors.length === 0) return;

  const errorData = errors.map(e => ({
    'Excel Row': e.row,
    'Error Reason': e.reason,
    ...e.data
  }));

  const worksheet = XLSX.utils.json_to_sheet(errorData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
  
  const baseName = originalFileName.replace(/\.[^/.]+$/, "");
  XLSX.writeFile(workbook, `${baseName}_Error_Report.xlsx`);
};
