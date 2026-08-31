export interface OneViewItem {
  id: string;
  allocationName: string;
  product: string;
  bucket: string;
  channel: string;
  date: string;
}

export interface CCReportDownloadItem {
  id: string;
  date: string;
  requestedBy: string;
  dateRange: string;
  allocator: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  fileSize?: string;
}

export interface CallRecordingDownloadItem {
  id: string;
  date: string;
  dateRange: string;
  allocator: string;
  requestCriteria: string;
  requestedBy: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  fileSize: string;
}

export interface WhatsAppMessageItem {
  id: string;
  name: string;
  accountNo: string;
  phoneNumber: string;
  product: string;
  bucket: string;
  allocator: string;
  outstanding: string;
  date: string;
  time: string;
  status: string;
}

export const mockOneViewReports: OneViewItem[] = [
  {
    id: 'ov-1',
    allocationName: 'Moneyview_Personal Loan_NPA_2026-08-30_14-24',
    product: 'Personal Loan',
    bucket: 'NPA',
    channel: 'Call',
    date: '2026-08-30',
  },
  {
    id: 'ov-2',
    allocationName: 'Moneyview_Personal Loan_NPA_2026-08-25_20-10',
    product: 'Personal Loan',
    bucket: 'NPA',
    channel: 'Call',
    date: '2026-08-25',
  },
  {
    id: 'ov-3',
    allocationName: 'Moneyview_Personal Loan_Pre Due_2026-05-28_17-09',
    product: 'Personal Loan',
    bucket: 'Pre Due',
    channel: 'Call',
    date: '2026-05-28',
  },
  {
    id: 'ov-4',
    allocationName: 'Moneyview_Personal Loan_Pre Due_2026-05-28_16-55',
    product: 'Personal Loan',
    bucket: 'Pre Due',
    channel: 'Call',
    date: '2026-05-28',
  },
  {
    id: 'ov-5',
    allocationName: 'Moneyview_Personal Loan_NPA_2026-05-21_13-15',
    product: 'Personal Loan',
    bucket: 'NPA',
    channel: 'Call',
    date: '2026-05-21',
  },
  {
    id: 'ov-6',
    allocationName: 'Moneyview_Personal Loan_Bucket 2_2026-05-18_16-51',
    product: 'Personal Loan',
    bucket: 'Bucket 2',
    channel: 'Call',
    date: '2026-05-18',
  },
];

export const mockCCDownloads: CCReportDownloadItem[] = [
  {
    id: 'cc-1',
    date: '30 August, 2026',
    requestedBy: 'Priyam kumar singh',
    dateRange: '30 August, 2026 to 30 August, 2026',
    allocator: 'Moneyview',
    status: 'SUCCESS',
    fileSize: '124.5 KB',
  },
  {
    id: 'cc-2',
    date: '21 May, 2026',
    requestedBy: 'Priyam kumar singh',
    dateRange: '21 May, 2026 to 21 May, 2026',
    allocator: 'Moneyview',
    status: 'SUCCESS',
    fileSize: '98.2 KB',
  },
  {
    id: 'cc-3',
    date: '18 May, 2026',
    requestedBy: 'Priyam kumar singh',
    dateRange: '18 May, 2026 to 18 May, 2026',
    allocator: 'Moneyview',
    status: 'SUCCESS',
    fileSize: '145.0 KB',
  },
];

export const mockCallRecordingsDownloads: CallRecordingDownloadItem[] = [
  {
    id: 'rec-1',
    date: '30 Aug 2026',
    dateRange: '30 Aug 2026 - 30 Aug 2026',
    allocator: 'Moneyview',
    requestCriteria: 'File: Moneyview_Personal Loan_NPA_2026-08-30_14-24',
    requestedBy: 'Priyam kumar singh',
    status: 'SUCCESS',
    fileSize: '48.69 KB',
  },
  {
    id: 'rec-2',
    date: '26 Aug 2026',
    dateRange: '25 Aug 2026 - 26 Aug 2026',
    allocator: 'Moneyview',
    requestCriteria: 'File: Moneyview_Personal Loan_NPA_2026-08-25_20-10',
    requestedBy: 'Priyam kumar singh',
    status: 'SUCCESS',
    fileSize: '512.23 KB',
  },
  {
    id: 'rec-3',
    date: '18 May 2026',
    dateRange: '18 May 2026 - 18 May 2026',
    allocator: 'Moneyview',
    requestCriteria: 'File: Moneyview_Personal Loan_Bucket 2_2026-05-18_16-51',
    requestedBy: 'Priyam kumar singh',
    status: 'SUCCESS',
    fileSize: '8.08 KB',
  },
];

export const mockAllocationFilesList = [
  'Moneyview_Personal Loan_NPA_2026-08-30_14-24',
  'Moneyview_Personal Loan_NPA_2026-08-25_20-10',
  'Moneyview_Personal Loan_Pre Due_2026-05-28_17-09',
  'Moneyview_Personal Loan_Pre Due_2026-05-28_16-55',
  'Moneyview_Personal Loan_NPA_2026-05-21_13-15',
  'Moneyview_Personal Loan_Bucket 2_2026-05-18_16-51',
];

export const mockFieldReports: OneViewItem[] = [];
export const mockDigitalEngagementDownloads: CCReportDownloadItem[] = [];
export const mockWhatsAppMessages: WhatsAppMessageItem[] = [];
