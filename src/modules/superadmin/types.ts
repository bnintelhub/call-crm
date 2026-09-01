export type OrgStatus = 'trial' | 'active' | 'grace' | 'expired' | 'suspended' | 'cancelled';

export type FeatureCode =
  | 'crm'
  | 'allocation'
  | 'calling'
  | 'ivr'
  | 'recordings'
  | 'ptp'
  | 'reports'
  | 'field';

export interface FeatureDef {
  code: FeatureCode;
  label: string;
  hint: string;
  group: 'core' | 'calling' | 'field';
  dependsOn: FeatureCode[];
}

export interface Quotas {
  seats: number;
  supervisors: number;
  telecallers: number;
  concurrentAgents: number;
  monthlyMinutes: number;
  storageGb: number;
  records: number;
}

export interface Usage {
  seatsUsed: number;
  supervisorsUsed: number;
  telecallersUsed: number;
  concurrentLive: number;
  minutesUsed: number;
  storageUsedGb: number;
  recordsUsed: number;
  callsThisMonth: number;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  features: FeatureCode[];
  quotas: Quotas;
  custom?: boolean;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  legalName: string;
  city: string;
  gst: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: OrgStatus;
  planId: string;
  features: FeatureCode[];
  quotas: Quotas;
  usage: Usage;
  startDate: string;
  endDate: string;
  graceDays: number;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  companyCode: string;
  detail: string;
}

export interface CompanyDraft {
  name: string;
  legalName: string;
  city: string;
  gst: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  features: FeatureCode[];
  quotas: Quotas;
  planId: string;
  startDate: string;
  endDate: string;
  graceDays: number;
}
