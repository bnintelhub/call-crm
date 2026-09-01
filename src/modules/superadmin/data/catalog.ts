import type { FeatureDef, Plan, Quotas } from '../types';

export const FEATURE_CATALOG: FeatureDef[] = [
  { code: 'crm', label: 'Collection CRM', hint: 'Customers, loans, history', group: 'core', dependsOn: [] },
  { code: 'allocation', label: 'Allocation & Campaigns', hint: 'Buckets, rules, assignment', group: 'core', dependsOn: ['crm'] },
  { code: 'ptp', label: 'PTP & Follow-ups', hint: 'Promise tracking and reminders', group: 'core', dependsOn: ['crm'] },
  { code: 'reports', label: 'Reports', hint: 'Call, collection, agent reports', group: 'core', dependsOn: [] },
  { code: 'calling', label: 'Progressive Dialer', hint: 'Agent states, dialer, dispositions', group: 'calling', dependsOn: ['crm'] },
  { code: 'ivr', label: 'IVR / Inbound', hint: 'IVR trees and inbound queues', group: 'calling', dependsOn: ['calling'] },
  { code: 'recordings', label: 'Call Recordings', hint: 'Playback with signed URLs', group: 'calling', dependsOn: ['calling'] },
  { code: 'field', label: 'Field Collection', hint: 'Visits, GPS, Phase 2', group: 'field', dependsOn: ['crm'] },
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
    name: 'CRM Lite',
    tagline: 'Collections CRM without calling',
    monthlyPrice: 12000,
    features: ['crm', 'allocation', 'ptp', 'reports'],
    quotas: { ...EMPTY_QUOTAS, seats: 10, supervisors: 2, telecallers: 8, concurrentAgents: 0, monthlyMinutes: 0, storageGb: 5, records: 25000 },
  },
  {
    id: 'calling',
    name: 'Calling',
    tagline: 'CRM + progressive dialer',
    monthlyPrice: 28000,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'recordings'],
    quotas: { ...EMPTY_QUOTAS, seats: 25, supervisors: 3, telecallers: 20, concurrentAgents: 15, monthlyMinutes: 50000, storageGb: 50, records: 100000 },
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'All modules except field',
    monthlyPrice: 48000,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'ivr', 'recordings'],
    quotas: { ...EMPTY_QUOTAS, seats: 50, supervisors: 6, telecallers: 40, concurrentAgents: 30, monthlyMinutes: 150000, storageGb: 200, records: 250000 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom modules and limits',
    monthlyPrice: 0,
    custom: true,
    features: ['crm', 'allocation', 'ptp', 'reports', 'calling', 'ivr', 'recordings', 'field'],
    quotas: { ...EMPTY_QUOTAS, seats: 100, supervisors: 12, telecallers: 80, concurrentAgents: 50, monthlyMinutes: 300000, storageGb: 500, records: 500000 },
  },
];

export function getPlan(id: string) {
  return PLANS.find((p) => p.id === id);
}
