export interface AllocationItem {
  id: string;
  allocationName: string;
  product: string;
  buckets: string;
  caseCounts: number;
  dnd: number;
  sumOfOutstanding: string;
  createdOn: string;
  allocationStatus: 'Fully allocated' | 'Partially allocated' | 'Unallocated' | 'Closed';
  collectionPercent: string;
  paymentFileStatus: string;
  tabCategory: '100% Allocated' | 'Unallocated' | 'Partially Allocated' | 'Expiring in 5 days' | 'Closed';
}

export const mockAllocations: AllocationItem[] = [
  {
    id: 'alloc-1',
    allocationName: 'Personal_Loan_NPA_2026_08-30',
    product: 'Personal Loan',
    buckets: 'NPA',
    caseCounts: 6,
    dnd: 0,
    sumOfOutstanding: '₹7.5 Lakh',
    createdOn: '30-Aug-2026 14:24',
    allocationStatus: 'Fully allocated',
    collectionPercent: '0.00%',
    paymentFileStatus: 'Upload File',
    tabCategory: '100% Allocated',
  },
  {
    id: 'alloc-2',
    allocationName: 'Personal_Loan_NPA_2026_08-25',
    product: 'Personal Loan',
    buckets: 'NPA',
    caseCounts: 6,
    dnd: 0,
    sumOfOutstanding: '₹7.5 Lakh',
    createdOn: '25-Aug-2026 20:10',
    allocationStatus: 'Fully allocated',
    collectionPercent: '0.00%',
    paymentFileStatus: 'Upload File',
    tabCategory: '100% Allocated',
  },
  {
    id: 'alloc-3',
    allocationName: 'Personal_Loan_PreDue_2026_05-28',
    product: 'Personal Loan',
    buckets: 'Pre Due',
    caseCounts: 320,
    dnd: 0,
    sumOfOutstanding: '₹17.4 Lakh',
    createdOn: '28-May-2026 17:09',
    allocationStatus: 'Fully allocated',
    collectionPercent: '0.00%',
    paymentFileStatus: 'Upload File',
    tabCategory: '100% Allocated',
  },
  {
    id: 'alloc-4',
    allocationName: 'Personal_Loan_DPD1-30_2026_08-28',
    product: 'Personal Loan',
    buckets: 'DPD 1-30',
    caseCounts: 840,
    dnd: 12,
    sumOfOutstanding: '₹42.8 Lakh',
    createdOn: '28-Aug-2026 11:15',
    allocationStatus: 'Partially allocated',
    collectionPercent: '4.25%',
    paymentFileStatus: 'Upload File',
    tabCategory: 'Partially Allocated',
  },
  {
    id: 'alloc-5',
    allocationName: 'Credit_Line_DPD31-60_2026_08-26',
    product: 'Credit Line',
    buckets: 'DPD 31-60',
    caseCounts: 512,
    dnd: 8,
    sumOfOutstanding: '₹28.9 Lakh',
    createdOn: '26-Aug-2026 16:40',
    allocationStatus: 'Fully allocated',
    collectionPercent: '1.80%',
    paymentFileStatus: 'Upload File',
    tabCategory: '100% Allocated',
  },
  {
    id: 'alloc-6',
    allocationName: 'Personal_Loan_NPA_2026_08-20',
    product: 'Personal Loan',
    buckets: 'NPA',
    caseCounts: 140,
    dnd: 4,
    sumOfOutstanding: '₹12.2 Lakh',
    createdOn: '20-Aug-2026 09:30',
    allocationStatus: 'Fully allocated',
    collectionPercent: '0.00%',
    paymentFileStatus: 'Upload File',
    tabCategory: 'Expiring in 5 days',
  },
  {
    id: 'alloc-7',
    allocationName: 'Home_Improvement_Fresh_2026_08-31',
    product: 'Personal Loan',
    buckets: 'Fresh',
    caseCounts: 620,
    dnd: 15,
    sumOfOutstanding: '₹35.6 Lakh',
    createdOn: '31-Aug-2026 10:00',
    allocationStatus: 'Unallocated',
    collectionPercent: '0.00%',
    paymentFileStatus: 'Upload File',
    tabCategory: 'Unallocated',
  },
  {
    id: 'alloc-8',
    allocationName: 'Auto_Refinance_DPD61-90_2026_07-15',
    product: 'Vehicle Loan',
    buckets: 'DPD 61-90',
    caseCounts: 95,
    dnd: 2,
    sumOfOutstanding: '₹8.4 Lakh',
    createdOn: '15-Jul-2026 18:22',
    allocationStatus: 'Closed',
    collectionPercent: '88.50%',
    paymentFileStatus: 'Processed',
    tabCategory: 'Closed',
  },
];

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadDate: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'Completed' | 'Processing' | 'Failed';
}

export const mockUploadHistory: UploadHistoryItem[] = [
  {
    id: 'UH-101',
    fileName: 'Moneyview_PL_NPA_Batch_Aug30.xlsx',
    uploadedBy: 'Zeeshan Anwar',
    uploadDate: '30-Aug-2026 14:20',
    totalRecords: 6,
    successfulRecords: 6,
    failedRecords: 0,
    status: 'Completed',
  },
  {
    id: 'UH-102',
    fileName: 'Moneyview_PL_DPD1_30_Batch_Aug28.xlsx',
    uploadedBy: 'Pooja Sharma',
    uploadDate: '28-Aug-2026 11:10',
    totalRecords: 840,
    successfulRecords: 838,
    failedRecords: 2,
    status: 'Completed',
  },
  {
    id: 'UH-103',
    fileName: 'Moneyview_CreditLine_Batch_Aug26.csv',
    uploadedBy: 'Amit Kumar',
    uploadDate: '26-Aug-2026 16:35',
    totalRecords: 512,
    successfulRecords: 512,
    failedRecords: 0,
    status: 'Completed',
  },
  {
    id: 'UH-104',
    fileName: 'Moneyview_PreDue_Batch_May28.xlsx',
    uploadedBy: 'Zeeshan Anwar',
    uploadDate: '28-May-2026 17:05',
    totalRecords: 320,
    successfulRecords: 320,
    failedRecords: 0,
    status: 'Completed',
  },
];
