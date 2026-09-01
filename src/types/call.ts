import type { User, Role } from './auth';

export type CallStatus = 'CONNECTED' | 'NOT_REACHABLE' | 'BUSY' | 'WRONG_NUMBER' | 'FAILED' | 'SCHEDULED';
export type DispositionType = 'PTP' | 'RTP' | 'CALL_BACK' | 'ALREADY_PAID' | 'DISPUTE' | 'NOT_INTERESTED' | 'NO_RESPONSE';

export interface Call {
  id: string;
  telecallerId: string;
  leadId?: string;
  customerName: string;
  phoneNumber: string;
  loanNumber?: string;
  amountDue?: number;
  durationSec: number;
  status: CallStatus;
  disposition?: DispositionType;
  ptpDate?: string;
  ptpAmount?: number;
  notes?: string;
  recordingUrl?: string;
  calledAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  phoneNumber: string;
  loanNumber: string;
  productType: string;
  bucket: string;
  dpdDays: number;
  totalDue: number;
  remainingDue: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PTP_PROMISED' | 'PAID' | 'ESCALATED';
  lastDisposition?: DispositionType;
  assignedTelecallerId?: string;
  assignedTelecallerName?: string;
  ptpDate?: string;
  ptpAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  customerName: string;
  phoneNumber: string;
  loanNumber: string;
  scheduledTime: string;
  status: 'UPCOMING' | 'COMPLETED' | 'MISSED';
  disposition: DispositionType;
  ptpAmount?: number;
  notes?: string;
}

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
  telecaller: User;
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
