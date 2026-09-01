import type { FeatureDef, Plan, PlatformSettings, Quotas, TelephonyTrunk } from '../types';

export const FEATURE_CATALOG: FeatureDef[] = [
  // ─────────────────────────────────────────────
  // 1. Core CRM & Recovery Data Operations
  // ─────────────────────────────────────────────
  {
    code: 'crm',
    label: 'Collection CRM Core & Debtor Profiles',
    hint: 'Accounts, loans, debtor 360 profile, payment timeline & lead cards',
    group: 'core',
    targetPage: '/dashboard & /my-data',
    dependsOn: [],
    iconName: 'Database',
  },
  {
    code: 'allocation',
    label: 'Data Allocation & Rule-based Bucketing',
    hint: 'Portfolio allocation, supervisor assignment & agent bucket mapping',
    group: 'core',
    targetPage: '/allocation & /ivr/allocation-list',
    dependsOn: ['crm'],
    iconName: 'Layers',
  },
  {
    code: 'bulk_upload',
    label: 'Bulk Data Upload (Excel / CSV)',
    hint: 'Multi-format parser, deduplication & portfolio dataset uploads',
    group: 'core',
    targetPage: '/bulk-upload & /allocation/upload-allocation',
    dependsOn: ['crm'],
    iconName: 'Upload',
  },
  {
    code: 'ptp',
    label: 'PTP & Broken Promise Engine',
    hint: 'Promise-to-pay tracking, broken PTP alerts & payment reminder schedules',
    group: 'core',
    targetPage: '/dashboard & /my-data',
    dependsOn: ['crm'],
    iconName: 'CalendarCheck',
    isPopular: true,
  },
  {
    code: 'payments',
    label: 'Daily Payments & Settlement Tracker',
    hint: 'Direct payment entries, settlement ledger & supervisor verification',
    group: 'core',
    targetPage: '/payments',
    dependsOn: ['crm'],
    iconName: 'Wallet',
  },
  {
    code: 'escalations',
    label: 'Dispute & Escalation Workflows',
    hint: 'Escalated cases, team lead dispute flags & resolution audit',
    group: 'core',
    targetPage: '/escalations',
    dependsOn: ['crm'],
    iconName: 'AlertTriangle',
  },

  // ─────────────────────────────────────────────
  // 2. Telephony, Voice & Live Floor
  // ─────────────────────────────────────────────
  {
    code: 'calling',
    label: 'Progressive Voice Dialer & WebRTC Softphone',
    hint: 'Agent softphone, click-to-dial, auto-wrapup timers & disposition codes',
    group: 'calling',
    targetPage: '/my-data & /ivr/campaigns',
    dependsOn: ['crm'],
    iconName: 'PhoneCall',
    isPopular: true,
  },
  {
    code: 'ivr',
    label: 'Inbound IVR & ACD Campaigns',
    hint: 'Multi-level IVR campaigns, DTMF routing & skill-based agent queueing',
    group: 'calling',
    targetPage: '/ivr & /ivr/campaigns',
    dependsOn: ['calling'],
    iconName: 'Network',
  },
  {
    code: 'recordings',
    label: 'Call Recordings & Audio Playback',
    hint: 'Encrypted audio playback, waveform player, signed URLs & call downloads',
    group: 'calling',
    targetPage: '/ivr/reports/call-recordings',
    dependsOn: ['calling'],
    iconName: 'Mic',
  },
  {
    code: 'monitoring',
    label: 'Live Floor Monitoring & Barge-in',
    hint: 'Real-time agent floor status, active call snooping, whisper & barge-in',
    group: 'calling',
    targetPage: '/monitoring',
    dependsOn: ['calling'],
    iconName: 'Activity',
    isPopular: true,
  },
  {
    code: 'call_history',
    label: 'Global Call Logs & History Stream',
    hint: 'Tenant-wide call attempts, durations, recordings & disposition filters',
    group: 'calling',
    targetPage: '/call-history',
    dependsOn: ['calling'],
    iconName: 'History',
  },

  // ─────────────────────────────────────────────
  // 3. Supervisor Reporting & Analytics
  // ─────────────────────────────────────────────
  {
    code: 'reports',
    label: 'Business Intelligence & Summary Dashboards',
    hint: 'Supervisor OneView, collection yield, contactability & hourly throughput',
    group: 'reports',
    targetPage: '/reports & /performance',
    dependsOn: ['crm'],
    iconName: 'BarChart3',
  },
  {
    code: 'report_one_view',
    label: 'One View Telemetry Report',
    hint: 'Consolidated agent KPIs, dialer stats & campaign progress in single view',
    group: 'reports',
    targetPage: '/ivr/reports/one-view',
    dependsOn: ['reports'],
    iconName: 'Layers',
  },
  {
    code: 'report_cc',
    label: 'Call Center (CC) Performance Reports',
    hint: 'AHT, agent idle time, connect rates, occupancy & disposition analytics',
    group: 'reports',
    targetPage: '/ivr/reports/cc-reports',
    dependsOn: ['reports', 'calling'],
    iconName: 'PhoneCall',
  },
  {
    code: 'report_field',
    label: 'Field Telemetry & Visit Reports',
    hint: 'Field agent geo-tracking, visit completion ratios & cash collection audits',
    group: 'reports',
    targetPage: '/ivr/reports/field-reports',
    dependsOn: ['reports'],
    iconName: 'MapPin',
  },
  {
    code: 'report_digital',
    label: 'Digital Engagement Analytics (WhatsApp/SMS)',
    hint: 'Automated message delivery, read rates, link clicks & payment conversions',
    group: 'reports',
    targetPage: '/ivr/reports/digital-engagement',
    dependsOn: ['reports'],
    iconName: 'Send',
  },
  {
    code: 'quality_scoring',
    label: 'Call Quality Scoring & Audit (QA)',
    hint: 'Supervisor scorecards, adherence audit, agent coaching & grading',
    group: 'reports',
    targetPage: '/ivr/score',
    dependsOn: ['calling', 'recordings'],
    iconName: 'Star',
  },

  // ─────────────────────────────────────────────
  // 4. Team & Floor Operations
  // ─────────────────────────────────────────────
  {
    code: 'team_management',
    label: 'Agent Groups & Team Provisioning',
    hint: 'Agent onboarding, skill tagging, campaign mapping & supervisor hierarchy',
    group: 'team',
    targetPage: '/ivr/agent-list & /ivr/agent-groups & /users',
    dependsOn: ['crm'],
    iconName: 'Users',
  },
  {
    code: 'agent_incentives',
    label: 'Agent Incentives & Target Gamification',
    hint: 'Collection targets, dynamic commission slabs, leaderboards & reward metrics',
    group: 'team',
    targetPage: '/ivr/incentives',
    dependsOn: ['crm'],
    iconName: 'Award',
  },
  {
    code: 'eod_management',
    label: 'EOD Record Submission & Approval',
    hint: 'End-of-day closing statements, daily summaries & supervisor sign-offs',
    group: 'team',
    targetPage: '/eod-admin & /eod-team & /eod-submit',
    dependsOn: ['crm'],
    iconName: 'ClipboardList',
  },
  {
    code: 'agent_training',
    label: 'Training Module & Knowledge Base',
    hint: 'Call objection scripts, compliance guidelines & agent onboard material',
    group: 'team',
    targetPage: '/ivr/training',
    dependsOn: ['crm'],
    iconName: 'GraduationCap',
  },

  // ─────────────────────────────────────────────
  // 5. Omnichannel, Field & AI Intelligence
  // ─────────────────────────────────────────────
  {
    code: 'whatsapp',
    label: 'WhatsApp Business API & 2-Way Chat',
    hint: 'Verified WhatsApp templates, payment links, bot flow & interactive chat',
    group: 'intelligence',
    targetPage: '/campaigns & /ivr/reports/digital-engagement',
    dependsOn: ['crm'],
    iconName: 'MessageSquare',
    isPopular: true,
  },
  {
    code: 'sms_broadcast',
    label: 'SMS Broadcast & DLT Campaign Engine',
    hint: 'Bulk SMS dispatches, dynamic variables & DLT template compliance',
    group: 'intelligence',
    targetPage: '/campaigns',
    dependsOn: ['crm'],
    iconName: 'Send',
  },
  {
    code: 'field',
    label: 'Field Collection Agent App & GPS Tracking',
    hint: 'Mobile field app, Geo-fencing, digital receipts & live map tracking',
    group: 'intelligence',
    targetPage: '/ivr/reports/field-reports',
    dependsOn: ['crm'],
    iconName: 'MapPin',
  },
  {
    code: 'ai_analytics',
    label: 'AI Call Speech Analytics & Sentiment Detection',
    hint: 'Automated transcription, debtor sentiment analysis & compliance flags',
    group: 'intelligence',
    targetPage: '/ivr/reports/cc-reports',
    dependsOn: ['calling', 'recordings'],
    iconName: 'Sparkles',
  },
  {
    code: 'export_data',
    label: 'Custom Column Data Export Utility',
    hint: 'Filterable data export to Excel / CSV with role-based masking rules',
    group: 'intelligence',
    targetPage: '/export',
    dependsOn: ['crm'],
    iconName: 'FileSpreadsheet',
  },
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

export const PLANS: Plan[] = [
  {
    id: 'crm-lite',
    name: 'Starter CRM',
    tagline: 'Streamlined collections CRM without telephony dialer',
    monthlyPrice: 12000,
    annualPrice: 115000,
    features: ['crm', 'allocation', 'ptp', 'reports'],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 10,
      supervisors: 2,
      telecallers: 8,
      concurrentAgents: 0,
      monthlyMinutes: 0,
      storageGb: 15,
      records: 30000,
    },
  },
  {
    id: 'calling',
    name: 'Growth Voice',
    tagline: 'Complete Collections CRM with Integrated Progressive Dialer',
    monthlyPrice: 28000,
    annualPrice: 268000,
    isPopular: true,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'recordings', 'whatsapp'],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 25,
      supervisors: 3,
      telecallers: 22,
      concurrentAgents: 18,
      monthlyMinutes: 60000,
      storageGb: 80,
      records: 120000,
    },
  },
  {
    id: 'growth',
    name: 'Scale Omnichannel',
    tagline: 'High volume recovery with Inbound IVR & WhatsApp triggers',
    monthlyPrice: 52000,
    annualPrice: 499000,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'ivr', 'recordings', 'whatsapp', 'field'],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 60,
      supervisors: 8,
      telecallers: 52,
      concurrentAgents: 45,
      monthlyMinutes: 200000,
      storageGb: 300,
      records: 350000,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise Cloud',
    tagline: 'Custom limits, dedicated SIP trunking & AI speech analytics',
    monthlyPrice: 95000,
    annualPrice: 910000,
    custom: true,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'ivr', 'recordings', 'field', 'whatsapp', 'ai_analytics'],
    quotas: {
      ...EMPTY_QUOTAS,
      seats: 150,
      supervisors: 20,
      telecallers: 130,
      concurrentAgents: 100,
      monthlyMinutes: 500000,
      storageGb: 1000,
      records: 1000000,
    },
  },
];

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
  // 1. Platform Identity & Branding
  platformName: 'BNORBIT Control Plane',
  supportEmail: 'support@bnorbit.com',
  supportPhone: '+91 8000 550 110',
  logoUrl: '',
  faviconUrl: '',
  enableWhiteLabel: false,

  // 2. Security & Access Control
  require2FAForAdmins: true,
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  requireSpecialChar: true,
  allowedIpRanges: '0.0.0.0/0',

  // 3. Billing & Subscription Defaults
  defaultCurrency: 'INR',
  invoicePrefix: 'INV-BN-',
  autoLockOnExpiry: true,
  defaultGraceDays: 3,
  enableAutoRenew: true,

  // 4. Trial & Onboarding Settings
  defaultTrialDays: 14,
  trialAutoStartOnSignup: true,
  defaultTrialFeatures: ['crm', 'calling', 'ivr', 'reports', 'whatsapp'],
  trialSeats: 5,
  trialMinutes: 500,
  trialStorageGb: 10,

  // 5. Telephony Configuration
  enableCallRecording: true,
  recordingRetentionDays: 90,
  defaultDialTimeoutSeconds: 30,
  maxConcurrentCallsPerTenant: 50,
  didAllocationStrategy: 'least_utilized',

  // 6. Usage & Limits Enforcement
  seatEnforcementPolicy: 'hard_block',
  usageAlertThresholdPct: 80,
  defaultStorageGb: 50,
  defaultMinutesCap: 25000,

  // 7. Scheduled Maintenance Mode
  maintenanceMode: false,
  maintenanceStartTime: '2026-09-07T02:00',
  maintenanceEndTime: '2026-09-07T04:00',
  maintenanceNotice: 'Scheduled platform maintenance window every Sunday 02:00 AM - 04:00 AM IST. Dialers will pause.',

  // 8. Integrations & API Keys
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

  // 9. Notifications & Alerts
  sendExpiryReminders: true,
  sendUsageAlerts: true,
  notifyAdminsEmail: true,
  notifyAdminsSlack: false,

  // 10. Audit & Compliance
  logRetentionDays: 365,
  enableActivityTracking: true,
  dataRetentionPolicyCompliant: true,
};

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}
