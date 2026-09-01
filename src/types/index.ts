// Merged: pankaj (monolithic types) + zeeshan (split types)
// Re-export everything from zeeshan's split modules
export * from './auth';
export * from './agent';
export * from './campaign';
export * from './call';

// Pankaj's additional types not covered above
export interface EodReport {
  id: string;
  telecallerId: string;
  reportDate: string;
  totalCalls: number;
  connected: number;
  notReachable: number;
  ptpCount: number;
  ptpAmount: number;
  alreadyPaid: number;
  totalActiveMin: number;
  totalInactiveMin: number;
  notes?: string;
  submittedAt: string;
  telecaller?: { id: string; name: string; teamLead?: { id: string; name: string } };
}

export interface PerformanceSummary {
  telecaller: import('./auth').User;
  totalCalls: number;
  connected: number;
  ptpCount: number;
  ptpAmount: number;
  alreadyPaid: number;
  totalActiveMin: number;
  totalInactiveMin: number;
  eodCount: number;
  reports: EodReport[];
}

export type SpecialCaseStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED';

export interface SpecialCase {
  id: string;
  loanRecordId: string;
  status: SpecialCaseStatus;
  reason: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  teamLead: { id: string; name: string };
  assignedBy: { id: string; name: string };
  loanRecord: {
    id: string;
    loanNumber: string;
    borrowerName: string;
    phoneNumber: string;
    dpdDays: number;
    dpdCategory: string;
    totalDueAmount: number;
    remainingAmount: number;
    allocationStatus: string;
    company: { name: string };
  };
}
