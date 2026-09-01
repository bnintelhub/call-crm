import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAllocations, mockUploadHistory, type AllocationItem, type UploadHistoryItem } from '../data/allocationData';

export interface NewAllocationPayload {
  companyName?: string;
  product: string;
  bucket: string;
  outstanding: string;
  startDate?: string;
  endDate?: string;
  caseCounts?: number;
  allocationName?: string;
}

interface AllocationState {
  allocationsList: AllocationItem[];
  uploadHistory: UploadHistoryItem[];
  lastAddedId: string | null;
  addAllocation: (
    payload: NewAllocationPayload,
    file?: File | null,
    uploadedBy?: string
  ) => AllocationItem;
  updateAllocation: (id: string, updates: Partial<AllocationItem>) => void;
  deleteAllocation: (id: string) => void;
  resetToDefaults: () => void;
}

/**
 * Format allocation name following standard convention:
 * `filename_year_date`
 * e.g., "Moneyview_Personal_Loan_2026_09-01" or "leads_npa_2026_08-30"
 */
export const generateAllocationName = (
  fileOrBaseName: string = 'Allocation_File',
  dateInput?: string | Date
): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');

  let cleanName = (fileOrBaseName || 'Allocation_File').trim();
  cleanName = cleanName.replace(/\.[^/.]+$/, ''); // remove file extension (.xlsx, .csv, etc.)
  cleanName = cleanName.replace(/[\s-]+/g, '_'); // normalize spaces & dashes to underscores

  // Naming format: filename_year_date
  return `${cleanName}_${year}_${month}-${day}`;
};

export const formatOutstanding = (rawVal: string): string => {
  if (!rawVal || !rawVal.trim()) return '₹10.0 Lakh';
  const trimmed = rawVal.trim();
  if (trimmed.startsWith('₹')) return trimmed;

  const num = parseFloat(trimmed.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return `₹${trimmed}`;

  if (num > 100000) {
    return `₹${(num / 100000).toFixed(1)} Lakh`;
  }
  if (trimmed.toLowerCase().includes('lakh') || trimmed.toLowerCase().includes('cr')) {
    return `₹${trimmed}`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatCreatedOn = (date: Date = new Date()): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

import { useCampaignStore } from './campaignStore';

export const useAllocationStore = create<AllocationState>()(
  persist(
    (set, get) => ({
      allocationsList: mockAllocations,
      uploadHistory: mockUploadHistory,
      lastAddedId: null,

      addAllocation: (payload, file, uploadedBy = 'Demo Admin') => {
        const id = `alloc-${Date.now()}`;
        const baseFileName =
          file?.name ||
          payload.allocationName ||
          `${payload.companyName || 'Moneyview'}_${payload.product || 'Product'}_${payload.bucket || 'Bucket'}`;

        const finalName = generateAllocationName(baseFileName, payload.startDate);

        const caseCounts =
          payload.caseCounts ||
          (file && file.size ? Math.min(Math.max(Math.floor(file.size / 1024) * 15, 60), 980) : Math.floor(Math.random() * 450) + 120);

        const newAllocationItem: AllocationItem = {
          id,
          allocationName: finalName,
          product: payload.product || 'Personal Loan',
          buckets: payload.bucket || 'Fresh',
          caseCounts,
          dnd: 0,
          sumOfOutstanding: formatOutstanding(payload.outstanding),
          createdOn: formatCreatedOn(new Date()),
          allocationStatus: 'Unallocated',
          collectionPercent: '0.00%',
          paymentFileStatus: 'Upload File',
          tabCategory: 'Unallocated',
        };

        const newHistoryRecord: UploadHistoryItem = {
          id: `UH-${Math.floor(100 + Math.random() * 900)}`,
          fileName: file?.name || `${finalName}.xlsx`,
          uploadedBy,
          uploadDate: formatCreatedOn(new Date()),
          totalRecords: caseCounts,
          successfulRecords: caseCounts,
          failedRecords: 0,
          status: 'Completed',
        };

        set((state) => ({
          allocationsList: [newAllocationItem, ...state.allocationsList],
          uploadHistory: [newHistoryRecord, ...state.uploadHistory],
          lastAddedId: id,
        }));

        // Automatically create and sync corresponding campaign entry
        try {
          useCampaignStore.getState().addCampaignFromAllocation(newAllocationItem);
        } catch (e) {
          console.warn('Could not sync to campaign store:', e);
        }

        return newAllocationItem;
      },

      updateAllocation: (id, updates) => {
        set((state) => ({
          allocationsList: state.allocationsList.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      deleteAllocation: (id) => {
        set((state) => ({
          allocationsList: state.allocationsList.filter((item) => item.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({
          allocationsList: mockAllocations,
          uploadHistory: mockUploadHistory,
          lastAddedId: null,
        });
      },
    }),
    {
      name: 'design-crm-allocation-store',
    }
  )
);

export default useAllocationStore;
