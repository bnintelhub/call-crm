export type OrgStatus = 'trial' | 'active' | 'grace' | 'expired' | 'suspended' | 'cancelled';

export type FeatureCode =
  // Core CRM & Allocation
  | 'crm'
  | 'allocation'
  | 'bulk_upload'
  | 'ptp'
  | 'payments'
  | 'escalations'
  // Telephony & Floor
  | 'calling'
  | 'ivr'
  | 'recordings'
  | 'monitoring'
  | 'call_history'
  // Reports & Analytics
  | 'reports'
  | 'report_one_view'
  | 'report_cc'
  | 'report_field'
  | 'report_digital'
  | 'quality_scoring'
  // Team & Operations
  | 'team_management'
  | 'agent_incentives'
  | 'eod_management'
  | 'agent_training'
  // Omnichannel, Field & Intelligence
  | 'whatsapp'
  | 'sms_broadcast'
  | 'field'
  | 'ai_analytics'
  | 'export_data';

export interface FeatureDef {
  code: FeatureCode;
  label: string;
  hint: string;
  group: 'core' | 'calling' | 'reports' | 'team' | 'intelligence';
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
  contactPhone: string;
  status: OrgStatus;
  planId: string;
  billingCycle: 'monthly' | 'annual';
  features: FeatureCode[];
  quotas: Quotas;
  usage: Usage;
  startDate: string;
  endDate: string;
  graceDays: number;
  lastLogin: string | null;
  createdAt: string;
  autoLockOnExpiry: boolean;
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
  contactPhone: string;
  adminPassword?: string;
  sendWelcomeEmail?: boolean;
  features: FeatureCode[];
  quotas: Quotas;
  planId: string;
  billingCycle: 'monthly' | 'annual';
  startDate: string;
  endDate: string;
  graceDays: number;
  autoLockOnExpiry: boolean;
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
