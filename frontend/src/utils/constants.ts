import type { Role } from '../types';

export const APP_CONFIG = {
  APP_NAME: 'BN Associates CRM',
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'design_crm_auth_token',
    AUTH_USER: 'design_crm_auth_user',
    THEME: 'design_crm_theme',
    ORG: 'design-crm-org-store',
    ALLOCATION: 'design-crm-allocation-store',
    AGENT: 'design-crm-agent-store',
  },
  DEFAULT_SUPERVISOR: 'Priyam Kumar Singh',
  DEFAULT_COMPANY: 'Moneyview',
  DEFAULT_AREA: 'Ranchi',
  DEFAULT_PINCODE: '834010',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  OPERATIONS_MANAGER: 3,
  TEAM_LEAD: 2,
  TELECALLER: 1,
};

export const STATUS_COLORS = {
  ACTIVE: 'emerald',
  INACTIVE: 'slate',
  LIVE: 'indigo',
  ASSIGNED: 'blue',
  DRAFT: 'amber',
  PAUSED: 'rose',
  COMPLETED: 'emerald',
  PTP: 'teal',
  CONNECTED: 'green',
  FAILED: 'red',
};
