import type { FeatureDef, Plan, PlatformSettings, Quotas, TelephonyTrunk } from '../types';

export const FEATURE_CATALOG: FeatureDef[] = [
  // ─── CORE SUPERVISOR MODULES (In Both Plans) ───
  {
    code: 'dashboard',
    label: 'Dashboard',
    hint: 'Overview KPIs & performance stats',
    group: 'core',
    iconName: 'LayoutDashboard',
    dependsOn: []
  },
  {
    code: 'my_data',
    label: 'My Calling Data',
    hint: 'Borrower records & manual dialing',
    group: 'core',
    iconName: 'Database',
    dependsOn: []
  },
  {
    code: 'reports',
    label: 'Reports & Analytics',
    hint: 'CC, field, digital engagement & call reports',
    group: 'core',
    iconName: 'BarChart3',
    dependsOn: []
  },
  {
    code: 'team_performance',
    label: 'Team Performance',
    hint: 'Agent targets & performance analytics',
    group: 'core',
    iconName: 'Users',
    dependsOn: []
  },
  {
    code: 'monitoring',
    label: 'Live Monitoring & EOD',
    hint: 'Agent state live monitor & EOD records',
    group: 'core',
    iconName: 'Activity',
    dependsOn: []
  },
  {
    code: 'allocation',
    label: 'Data Allocation',
    hint: 'Excel upload & bucket allocation list',
    group: 'core',
    iconName: 'Layers',
    dependsOn: []
  },
  {
    code: 'campaigns',
    label: 'Campaigns Management',
    hint: 'Outbound campaigns & dialer modes',
    group: 'core',
    iconName: 'Megaphone',
    dependsOn: []
  },
  {
    code: 'ptp_tasks',
    label: 'Priority Tasks (PTP)',
    hint: 'Promise to pay & followup reminders',
    group: 'core',
    iconName: 'CalendarCheck',
    dependsOn: []
  },
  {
    code: 'whatsapp',
    label: 'WhatsApp Messages',
    hint: 'Direct WhatsApp communication & templates',
    group: 'core',
    iconName: 'MessageSquare',
    dependsOn: []
  },

  // ─── IVR SPECIFIC MODULES (Only in With IVR Plan) ───
  {
    code: 'ivr_inbound',
    label: 'IVR & Inbound Calls',
    hint: 'IVR trees, inbound queues & auto routing',
    group: 'ivr',
    iconName: 'PhoneCall',
    dependsOn: []
  },
  {
    code: 'ivr_agent_groups',
    label: 'IVR Agent Groups',
    hint: 'Skill-based agent groups & ring routing',
    group: 'ivr',
    iconName: 'Headphones',
    dependsOn: []
  },
  {
    code: 'call_recordings',
    label: 'Call Recordings',
    hint: 'Playback with signed URLs & audio audit',
    group: 'ivr',
    iconName: 'FileAudio',
    dependsOn: []
  },
  {
    code: 'ivr_incentives',
    label: 'Incentives & Score',
    hint: 'Agent score cards, incentives & training',
    group: 'ivr',
    iconName: 'Award',
    dependsOn: []
  },

  // Additional Modules for Features Matrix Compatibility
  {
    code: 'ai_analytics',
    label: 'AI Call Speech Analytics & Sentiment Detection',
    hint: 'Automated transcription, debtor sentiment analysis & compliance flags',
    group: 'intelligence',
    iconName: 'Sparkles',
    dependsOn: ['call_recordings']
  },
  {
    code: 'sms_broadcast',
    label: 'SMS Broadcast & DLT Campaign Engine',
    hint: 'Bulk SMS dispatches, dynamic variables & DLT template compliance',
    group: 'intelligence',
    iconName: 'Send',
    dependsOn: ['dashboard']
  },
  {
    code: 'export_data',
    label: 'Custom Column Data Export Utility',
    hint: 'Filterable data export to Excel / CSV with role-based masking rules',
    group: 'intelligence',
    iconName: 'FileSpreadsheet',
    dependsOn: ['my_data']
  }
];

export const EMPTY_QUOTAS: Quotas = {
  seats: 10,
  supervisors: 2,
  telecallers: 8,
  concurrentAgents: 5,
  monthlyMinutes: 10000,
  storageGb: 10,
  records: 25000,
};

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'manual-calling',
    name: 'Manual Calling (No IVR)',
    tagline: 'Collection CRM with Manual Click-to-Call (Without IVR)',
    monthlyPrice: 12000,
    annualPrice: 115000,
    hasIvr: false,
    callingType: 'manual',
    features: [
      'dashboard',
      'my_data',
      'reports',
      'team_performance',
      'monitoring',
      'allocation',
      'campaigns',
      'ptp_tasks',
      'whatsapp',
    ],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 10,
      supervisors: 2,
      telecallers: 8,
      concurrentAgents: 0,
      monthlyMinutes: 0,
      storageGb: 5,
      records: 25000,
    },
  },
  {
    id: 'with-ivr',
    name: 'Auto Calling & IVR (With IVR)',
    tagline: 'Complete Suite: Automatic Progressive Dialer + Inbound IVR & Call Recordings',
    monthlyPrice: 35000,
    annualPrice: 350000,
    hasIvr: true,
    callingType: 'auto',
    isPopular: true,
    features: [
      'dashboard',
      'my_data',
      'reports',
      'team_performance',
      'monitoring',
      'allocation',
      'campaigns',
      'ptp_tasks',
      'whatsapp',
      'ivr_inbound',
      'ivr_agent_groups',
      'call_recordings',
      'ivr_incentives',
    ],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 30,
      supervisors: 4,
      telecallers: 25,
      concurrentAgents: 20,
      monthlyMinutes: 80000,
      storageGb: 100,
      records: 150000,
    },
  },
];

export const PLANS: Plan[] = DEFAULT_PLANS;

export function getPlan(id?: string) {
  if (!id) return DEFAULT_PLANS[0];
  return PLANS.find((p) => p.id === id) || DEFAULT_PLANS[0];
}

export const TELEPHONY_TRUNKS: TelephonyTrunk[] = [
  {
    id: 'trunk-1',
    name: 'Tata SIP Primary Gate (North/West)',
    provider: 'Tata Teleservices',
    status: 'operational',
    latencyMs: 18,
    channelsActive: 84,
    channelsMax: 200,
    didAllocated: 140,
    didTotal: 180,
    region: 'Mumbai / Delhi',
    lastHeartbeat: 'Just now',
  },
  {
    id: 'trunk-2',
    name: 'Airtel Enterprise SIP (South)',
    provider: 'Airtel Enterprise',
    status: 'operational',
    latencyMs: 22,
    channelsActive: 56,
    channelsMax: 150,
    didAllocated: 95,
    didTotal: 120,
    region: 'Bengaluru / Hyderabad',
    lastHeartbeat: '12s ago',
  },
  {
    id: 'trunk-3',
    name: 'Exotel Voice Fallback Gateway',
    provider: 'Exotel',
    status: 'operational',
    latencyMs: 34,
    channelsActive: 22,
    channelsMax: 100,
    didAllocated: 40,
    didTotal: 60,
    region: 'PAN India',
    lastHeartbeat: '5s ago',
  },
  {
    id: 'trunk-4',
    name: 'Twilio Programmable Voice (Tier 2)',
    provider: 'Twilio',
    status: 'degraded',
    latencyMs: 82,
    channelsActive: 8,
    channelsMax: 50,
    didAllocated: 12,
    didTotal: 25,
    region: 'APAC (Singapore)',
    lastHeartbeat: '45s ago',
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  platformName: 'BNORBIT Control Plane',
  supportEmail: 'support@bnorbit.com',
  supportPhone: '+91 8000 550 110',
  logoUrl: '',
  faviconUrl: '',
  enableWhiteLabel: false,

  require2FAForAdmins: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireSpecialChar: true,
  allowedIpRanges: '0.0.0.0/0',

  defaultCurrency: 'INR',
  invoicePrefix: 'INV-BN-',
  autoLockOnExpiry: true,
  defaultGraceDays: 3,
  enableAutoRenew: true,

  defaultTrialDays: 14,
  trialAutoStartOnSignup: true,
  defaultTrialFeatures: ['dashboard', 'my_data', 'reports', 'allocation', 'whatsapp'],
  trialSeats: 5,
  trialMinutes: 500,
  trialStorageGb: 10,

  enableCallRecording: true,
  recordingRetentionDays: 90,
  defaultDialTimeoutSeconds: 30,
  maxConcurrentCallsPerTenant: 50,
  didAllocationStrategy: 'least_utilized',

  seatEnforcementPolicy: 'hard_block',
  usageAlertThresholdPct: 80,
  defaultStorageGb: 50,
  defaultMinutesCap: 25000,

  maintenanceMode: false,
  maintenanceStartTime: '2026-09-07T02:00',
  maintenanceEndTime: '2026-09-07T04:00',
  maintenanceNotice: 'Scheduled platform maintenance window every Sunday 02:00 AM - 04:00 AM IST. Dialers will pause.',

  razorpayKeyId: 'rzp_live_894726594238',
  razorpayKeySecret: '••••••••••••••••••••••••',
  smsApiKey: 'sms_live_9384729184',
  smsSenderId: 'BNORBT',
  whatsappApiToken: 'EAAQ93847••••••••••••••••••••••',
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpUser: 'apikey',
  smtpPass: '••••••••••••••••••••••••',
  webhookUrl: 'https://api.bnorbit.com/v1/webhooks/events',

  sendExpiryReminders: true,
  sendUsageAlerts: true,
  notifyAdminsEmail: true,
  notifyAdminsSlack: false,

  logRetentionDays: 365,
  enableActivityTracking: true,
  dataRetentionPolicyCompliant: true,
};
