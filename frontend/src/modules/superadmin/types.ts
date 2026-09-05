export type OrgStatus = 'trial' | 'active' | 'grace' | 'expired' | 'suspended' | 'cancelled';

export type FeatureCode =
  // Real Supervisor Core Modules
  | 'dashboard'
  | 'my_data'
  | 'reports'
  | 'team_performance'
  | 'monitoring'
  | 'allocation'
  | 'campaigns'
  | 'ptp_tasks'
  | 'whatsapp'
  // IVR Specific Modules
  | 'ivr_inbound'
  | 'ivr_agent_groups'
  | 'call_recordings'
  | 'ivr_incentives'
  // General / Legacy modules
  | 'crm'
  | 'calling'
  | 'ivr'
  | 'recordings'
  | 'ptp'
  | 'field'
  | 'bulk_upload'
  | 'payments'
  | 'escalations'
  | 'call_history'
  | 'report_one_view'
  | 'report_cc'
  | 'report_field'
  | 'report_digital'
  | 'quality_scoring'
  | 'team_management'
  | 'agent_incentives'
  | 'eod_management'
  | 'agent_training'
  | 'sms_broadcast'
  | 'ai_analytics'
  | 'export_data';

export interface FeatureDef {
  code: FeatureCode;
  label: string;
  hint: string;
  group: 'core' | 'calling' | 'ivr' | 'field' | 'reports' | 'team' | 'intelligence';
  targetPage?: string;
  dependsOn: FeatureCode[];
  iconName?: string;
  isPopular?: boolean;
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
  annualPrice?: number;
  hasIvr?: boolean;
  callingType?: 'manual' | 'auto';
  features: FeatureCode[];
  quotas: Quotas;
  custom?: boolean;
  isPopular?: boolean;
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
  loginEmail?: string;
  contactPhone: string;
  adminPassword?: string;
  activationKey?: string;
  activationKeyStatus?: 'active' | 'deactivated';
  pricePerUser?: number;
  totalMonthlyBilling?: number;
  paymentStatus?: 'internal' | 'paid' | 'pending';
  status: OrgStatus;
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  features: FeatureCode[];
  quotas: Quotas;
  usage: Usage;
  startDate: string;
  endDate: string;
  graceDays: number;
  lastLogin: string | null;
  createdAt: string;
  autoLockOnExpiry?: boolean;
  renewalRequested?: boolean;
  renewalRequestedAt?: string;
  lastRenewedAt?: string;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  companyCode: string;
  detail: string;
  category?: 'company' | 'security' | 'subscription' | 'limits' | 'modules' | 'system';
}

export interface CompanyDraft {
  name: string;
  legalName: string;
  city: string;
  gst: string;
  contactName: string;
  contactEmail: string;
  loginEmail?: string;
  contactPhone: string;
  adminPassword?: string;
  activationKey?: string;
  pricePerUser?: number;
  totalMonthlyBilling?: number;
  paymentStatus?: 'internal' | 'paid' | 'pending';
  sendWelcomeEmail?: boolean;
  features: FeatureCode[];
  quotas: Quotas;
  planId?: string;
  billingCycle?: 'monthly' | 'annual';
  startDate: string;
  endDate: string;
  graceDays: number;
  autoLockOnExpiry?: boolean;
}

export interface TelephonyTrunk {
  id: string;
  name: string;
  provider: 'Twilio' | 'Exotel' | 'Tata Teleservices' | 'Airtel Enterprise' | 'Custom SIP';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  latencyMs: number;
  channelsActive: number;
  channelsMax: number;
  didAllocated: number;
  didTotal: number;
  region: string;
  lastHeartbeat: string;
}

export interface PlatformSettings {
  // 1. Platform Identity & Branding
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableWhiteLabel: boolean;

  // 2. Security & Access Control
  require2FAForAdmins: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireSpecialChar: boolean;
  allowedIpRanges: string;

  // 3. Billing & Subscription Defaults
  defaultCurrency: 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP';
  invoicePrefix: string;
  autoLockOnExpiry: boolean;
  defaultGraceDays: number;
  enableAutoRenew: boolean;

  // 4. Trial & Onboarding Settings
  defaultTrialDays: number;
  trialAutoStartOnSignup: boolean;
  defaultTrialFeatures: FeatureCode[];
  trialSeats: number;
  trialMinutes: number;
  trialStorageGb: number;

  // 5. Telephony Configuration
  enableCallRecording: boolean;
  recordingRetentionDays: number;
  defaultDialTimeoutSeconds: number;
  maxConcurrentCallsPerTenant: number;
  didAllocationStrategy: 'round_robin' | 'least_utilized' | 'sticky_tenant';

  // 6. Usage & Limits Enforcement
  seatEnforcementPolicy: 'hard_block' | 'soft_warning';
  usageAlertThresholdPct: number;
  defaultStorageGb: number;
  defaultMinutesCap: number;

  // 7. Scheduled Maintenance Mode
  maintenanceMode: boolean;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  maintenanceNotice: string;

  // 8. Integrations & API Keys
  razorpayKeyId: string;
  razorpayKeySecret: string;
  smsApiKey: string;
  smsSenderId: string;
  whatsappApiToken: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  webhookUrl: string;

  // 9. Notifications & Alerts
  sendExpiryReminders: boolean;
  sendUsageAlerts: boolean;
  notifyAdminsEmail: boolean;
  notifyAdminsSlack: boolean;

  // 10. Audit & Compliance
  logRetentionDays: number;
  enableActivityTracking: boolean;
  dataRetentionPolicyCompliant: boolean;
}
