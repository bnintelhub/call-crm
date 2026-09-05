import { create } from 'zustand';
import type { AuditLog, Company, CompanyDraft, FeatureCode, OrgStatus, Plan, PlatformSettings, Quotas, TelephonyTrunk } from './types';
import { DEFAULT_PLANS, DEFAULT_PLATFORM_SETTINGS, TELEPHONY_TRUNKS, getPlan } from './data/catalog';
import { seedAudits, seedCompanies } from './data/mock';
import { generateActivationKey, generateLoginEmail, parseActivationKey } from './utils/activationKey';

const PLANS_STORAGE_KEY = 'bnorbit_sa_plans_v3';

function loadStoredPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load stored plans', e);
  }
  return DEFAULT_PLANS;
}

function persistPlans(plans: Plan[]) {
  try {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to persist plans', e);
  }
}

const COMPANIES_STORAGE_KEY = 'bnorbit_sa_companies_v4';

function loadStoredCompanies(): Company[] {
  try {
    const raw = localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any, index: number) => {
          const code = c?.code ? String(c.code) : `BN-${1040 + index}`;
          const codeDigits = code.replace(/[^0-9]/g, '') || '1000';
          const userCount = Number(c?.quotas?.telecallers || c?.quotas?.seats || 10);
          const price = Number(c?.pricePerUser || 2000);
          const totalMonthly = c?.totalMonthlyBilling != null ? Number(c.totalMonthlyBilling) : userCount * price;

          return {
            id: c?.id || `org-${Date.now()}-${index}`,
            code,
            name: c?.name || 'Company',
            legalName: c?.legalName || c?.name || 'Company',
            city: c?.city || 'India',
            gst: c?.gst || '',
            contactName: c?.contactName || 'Admin',
            contactEmail: c?.contactEmail || '',
            loginEmail: c?.loginEmail || generateLoginEmail(c?.contactName || 'admin', c?.name || 'company', codeDigits),
            contactPhone: c?.contactPhone || '',
            adminPassword: c?.adminPassword || `BNOrbit@${codeDigits}#2026`,
            activationKey: c?.activationKey || generateActivationKey(c?.name || 'Company', 'IVR', c?.endDate),
            activationKeyStatus: c?.activationKeyStatus || (c?.status === 'suspended' ? 'deactivated' : 'active'),
            pricePerUser: price,
            totalMonthlyBilling: totalMonthly,
            paymentStatus: c?.paymentStatus || 'internal',
            status: c?.status || 'trial',
            planId: c?.planId || 'user-billing',
            billingCycle: c?.billingCycle || 'monthly',
            autoLockOnExpiry: c?.autoLockOnExpiry ?? true,
            renewalRequested: Boolean(c?.renewalRequested),
            renewalRequestedAt: c?.renewalRequestedAt || undefined,
            lastRenewedAt: c?.lastRenewedAt || undefined,
            features: Array.isArray(c?.features) && c.features.length > 0 ? c.features : ['dashboard', 'my_data', 'reports'],
            quotas: {
              seats: userCount,
              telecallers: userCount,
              supervisors: Number(c?.quotas?.supervisors || 2),
              concurrentAgents: Number(c?.quotas?.concurrentAgents || userCount),
              monthlyMinutes: Number(c?.quotas?.monthlyMinutes || 20000),
              storageGb: Number(c?.quotas?.storageGb || 20),
              records: Number(c?.quotas?.records || 30000),
              ...(c?.quotas || {}),
            },
            usage: {
              seatsUsed: Number(c?.usage?.seatsUsed || 0),
              supervisorsUsed: Number(c?.usage?.supervisorsUsed || 0),
              telecallersUsed: Number(c?.usage?.telecallersUsed || 0),
              concurrentLive: Number(c?.usage?.concurrentLive || 0),
              minutesUsed: Number(c?.usage?.minutesUsed || 0),
              storageUsedGb: Number(c?.usage?.storageUsedGb || 0),
              recordsUsed: Number(c?.usage?.recordsUsed || 0),
              callsThisMonth: Number(c?.usage?.callsThisMonth || 0),
              ...(c?.usage || {}),
            },
            startDate: c?.startDate || '2026-04-01',
            endDate: c?.endDate || '2026-10-01',
            graceDays: Number(c?.graceDays ?? 3),
            lastLogin: c?.lastLogin || null,
            createdAt: c?.createdAt || new Date().toISOString(),
          };
        });
      }
    }
  } catch (e) {
    console.error('Failed to load stored companies', e);
  }
  return seedCompanies;
}

function persistCompanies(companies: Company[]) {
  try {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
  } catch (e) {
    console.error('Failed to persist companies', e);
  }
}

interface SuperAdminState {
  companies: Company[];
  audits: AuditLog[];
  plans: Plan[];
  settings: PlatformSettings;
  trunks: TelephonyTrunk[];
  impersonatedCompanyId: string | null;

  addPlan: (plan: Omit<Plan, 'id'>) => Plan;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  resetPlansToDefault: () => void;

  addCompany: (draft: CompanyDraft) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  setFeatures: (id: string, features: FeatureCode[]) => void;
  setQuotas: (id: string, quotas: Quotas) => void;
  setStatus: (id: string, status: OrgStatus, detail: string) => void;
  stopCompany: (id: string, reason?: string) => void;
  resumeCompany: (id: string) => void;
  extendDays: (id: string, days: number) => void;
  requestRenewal: (companyId: string) => void;
  renewCompanySubscription: (companyId: string, newEndDate: string, newActivationKey: string) => void;
  activateCompanyKey: (companyIdOrCode: string, newKey: string) => { success: boolean; message: string; newEndDate?: string };
  sendCredentials: (id: string) => boolean;
  impersonateCompany: (id: string) => void;
  clearImpersonation: () => void;
  updateTrunkStatus: (id: string, status: TelephonyTrunk['status']) => void;
  updateSettings: (patch: Partial<PlatformSettings>) => void;
}

function nextCode(companies: Company[]) {
  const nums = (companies || [])
    .map((c) => {
      if (!c || !c.code) return NaN;
      const numPart = String(c.code).replace(/[^0-9]/g, '');
      return numPart ? Number(numPart) : NaN;
    })
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `BN-${next}`;
}

function pushAudit(audits: AuditLog[], entry: Omit<AuditLog, 'id' | 'at'>): AuditLog[] {
  return [
    {
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      ...entry,
    },
    ...audits,
  ];
}

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  companies: loadStoredCompanies(),
  audits: seedAudits,
  plans: loadStoredPlans(),
  settings: DEFAULT_PLATFORM_SETTINGS,
  trunks: TELEPHONY_TRUNKS,
  impersonatedCompanyId: null,

  addPlan: (planInput) => {
    const newPlan: Plan = {
      ...planInput,
      id: `plan-${Date.now()}`,
      custom: true,
    };
    const nextPlans = [...get().plans, newPlan];
    persistPlans(nextPlans);
    set((s) => ({
      plans: nextPlans,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Plan created',
        companyCode: 'GLOBAL',
        detail: `Created plan "${newPlan.name}" (₹${newPlan.monthlyPrice}/mo)`,
      }),
    }));
    return newPlan;
  },

  updatePlan: (id, patch) => {
    const nextPlans = get().plans.map((p) => (p.id === id ? { ...p, ...patch } : p));
    persistPlans(nextPlans);
    const updated = nextPlans.find((p) => p.id === id);
    set((s) => ({
      plans: nextPlans,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Plan updated',
        companyCode: 'GLOBAL',
        detail: `Updated plan "${updated?.name || id}"`,
      }),
    }));
  },

  deletePlan: (id) => {
    const target = get().plans.find((p) => p.id === id);
    const nextPlans = get().plans.filter((p) => p.id !== id);
    persistPlans(nextPlans);
    set((s) => ({
      plans: nextPlans,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Plan deleted',
        companyCode: 'GLOBAL',
        detail: `Deleted plan "${target?.name || id}"`,
      }),
    }));
  },

  resetPlansToDefault: () => {
    persistPlans(DEFAULT_PLANS);
    set({ plans: DEFAULT_PLANS });
  },

  addCompany: (draft) => {
    const plan = draft.planId ? (get().plans.find((p) => p.id === draft.planId) || getPlan(draft.planId)) : undefined;
    const userLimit = draft.quotas?.telecallers || draft.quotas?.seats || 10;
    const hasIvr = (draft.features || []).some((f) => f.startsWith('ivr_') || f === 'call_recordings');
    const planTag = hasIvr ? 'IVR' : 'CRM';
    const activationKey = draft.activationKey || generateActivationKey(draft.name || 'Company', planTag, draft.endDate);
    const code = nextCode(get().companies);
    const codeDigits = code.replace(/[^0-9]/g, '') || '1000';
    const loginEmail = draft.loginEmail || generateLoginEmail(draft.contactName || 'admin', draft.name || 'company', codeDigits);
    const userPrice = draft.pricePerUser || 2000;
    const totalMonthly = draft.totalMonthlyBilling != null ? draft.totalMonthlyBilling : userLimit * userPrice;

    const company: Company = {
      id: `org-${Date.now()}`,
      code,
      name: draft.name || 'Company',
      legalName: draft.legalName || draft.name || 'Company',
      city: draft.city || 'India',
      gst: draft.gst || '',
      contactName: draft.contactName || 'Admin',
      contactEmail: draft.contactEmail || '',
      loginEmail,
      contactPhone: draft.contactPhone || '',
      adminPassword: draft.adminPassword || `BNOrbit@${codeDigits}#2026`,
      activationKey,
      pricePerUser: userPrice,
      totalMonthlyBilling: totalMonthly,
      paymentStatus: draft.paymentStatus || 'internal',
      status: 'trial',
      planId: draft.planId || 'user-billing',
      billingCycle: draft.billingCycle || 'monthly',
      autoLockOnExpiry: draft.autoLockOnExpiry ?? true,
      features: (draft.features && draft.features.length) ? draft.features : (plan?.features ?? ['dashboard', 'my_data', 'reports']),
      quotas: {
        seats: draft.quotas?.seats || userLimit,
        telecallers: draft.quotas?.telecallers || userLimit,
        supervisors: draft.quotas?.supervisors || 2,
        concurrentAgents: draft.quotas?.concurrentAgents || userLimit,
        monthlyMinutes: draft.quotas?.monthlyMinutes || 20000,
        storageGb: draft.quotas?.storageGb || 20,
        records: draft.quotas?.records || 30000,
      },
      usage: {
        seatsUsed: 1,
        supervisorsUsed: 0,
        telecallersUsed: 0,
        concurrentLive: 0,
        minutesUsed: 0,
        storageUsedGb: 0,
        recordsUsed: 0,
        callsThisMonth: 0,
      },
      startDate: draft.startDate || new Date().toISOString().slice(0, 10),
      endDate: draft.endDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      graceDays: draft.graceDays ?? 3,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    const nextCompanies = [company, ...get().companies];
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company provisioned',
        companyCode: company.code,
        detail: `Created ${company.name} (${userLimit} users · Key: ${activationKey})`,
      }),
    }));

    return company;
  },

  updateCompany: (id, patch) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) => (c.id === id ? { ...c, ...patch } : c));
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company updated',
        companyCode: company.code,
        detail: `Updated profile for ${company.name}`,
      }),
    }));
  },

  deleteCompany: (id) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.filter((c) => c.id !== id);
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company deleted',
        companyCode: company.code,
        detail: `Purged tenant ${company.name}`,
      }),
    }));
  },

  setFeatures: (id, features) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) => (c.id === id ? { ...c, features } : c));
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Modules updated',
        companyCode: company.code,
        detail: features.join(', ') || 'No modules',
      }),
    }));
  },

  setQuotas: (id, quotas) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) => (c.id === id ? { ...c, quotas } : c));
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Limits updated',
        companyCode: company.code,
        detail: `${quotas.seats} seats · ${quotas.telecallers} telecallers`,
      }),
    }));
  },

  setStatus: (id, status, detail) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const isSuspended = status === 'suspended';
    const nextCompanies = get().companies.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            activationKeyStatus: (isSuspended ? 'deactivated' : 'active') as 'active' | 'deactivated',
          }
        : c
    );
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: status === 'active' ? 'Company reactivated' : isSuspended ? 'Company suspended & key deactivated' : 'Status changed',
        companyCode: company.code,
        detail,
      }),
    }));
  },

  stopCompany: (id, reason) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) =>
      c.id === id
        ? {
            ...c,
            status: 'suspended' as OrgStatus,
            activationKeyStatus: 'deactivated' as const,
          }
        : c
    );
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company stopped & key deactivated',
        companyCode: company.code,
        detail: reason || `Stopped ${company.name}; 16-digit activation key (${company.activationKey}) deactivated.`,
      }),
    }));
  },

  resumeCompany: (id) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) =>
      c.id === id
        ? {
            ...c,
            status: 'active' as OrgStatus,
            activationKeyStatus: 'active' as const,
          }
        : c
    );
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company resumed & key reactivated',
        companyCode: company.code,
        detail: `Resumed ${company.name}; activation key (${company.activationKey}) restored to active status.`,
      }),
    }));
  },

  extendDays: (id, days) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const end = new Date(company.endDate);
    end.setDate(end.getDate() + days);
    const endDate = end.toISOString().slice(0, 10);
    const nextCompanies = get().companies.map((c) => (c.id === id ? { ...c, endDate, status: 'active' as OrgStatus } : c));
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: `Extended ${days} days`,
        companyCode: company.code,
        detail: `New end date ${endDate}`,
      }),
    }));
  },

  requestRenewal: (id) => {
    const company = get().companies.find((c) => c.id === id || c.code === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) =>
      c.id === company.id
        ? {
            ...c,
            renewalRequested: true,
            renewalRequestedAt: new Date().toISOString(),
          }
        : c
    );
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: company.contactName || 'Supervisor',
        action: 'Renewal requested',
        companyCode: company.code,
        detail: `Supervisor requested subscription renewal for ${company.name}`,
      }),
    }));
  },

  renewCompanySubscription: (id, newEndDate, newActivationKey) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    const nextCompanies = get().companies.map((c) =>
      c.id === id
        ? {
            ...c,
            activationKey: newActivationKey,
            activationKeyStatus: 'active' as const,
            endDate: newEndDate,
            renewalRequested: false,
            lastRenewedAt: new Date().toISOString(),
            status: (c.status === 'suspended' || c.status === 'expired') ? ('active' as OrgStatus) : c.status,
          }
        : c
    );
    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: 'Super Admin',
        action: 'Subscription renewed',
        companyCode: company.code,
        detail: `Renewed ${company.name}. New key: ${newActivationKey}, valid till ${newEndDate}`,
      }),
    }));
  },

  activateCompanyKey: (companyIdOrCode, newKey) => {
    if (!newKey) {
      return { success: false, message: 'Please provide an activation key.' };
    }
    const cleanKey = newKey.trim().toUpperCase();
    const parsed = parseActivationKey(cleanKey);
    if (!parsed) {
      return {
        success: false,
        message: 'Invalid key format. Key must be 16 alphanumeric characters (e.g. UDAAN-IVR-20261104).',
      };
    }

    const cleanInput = companyIdOrCode?.toLowerCase().trim() || '';
    const companies = get().companies;

    // Find company by ID, code, or matched parsed code
    let company = companies.find(
      (c) =>
        c.id === companyIdOrCode ||
        c.code?.toLowerCase() === cleanInput ||
        c.loginEmail?.toLowerCase() === cleanInput ||
        c.contactEmail?.toLowerCase() === cleanInput
    );

    if (!company) {
      // Fallback: match by company code prefix in parsed key (e.g. UDAAN)
      company = companies.find((c) => {
        const cleanComp = (c.name || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return cleanComp.startsWith(parsed.companyCode) || parsed.companyCode.startsWith(cleanComp.slice(0, 5));
      });
    }

    if (!company && companies.length > 0) {
      company = companies[0];
    }

    if (!company) {
      return { success: false, message: 'No matching company tenant found.' };
    }

    const updatedKey = `${parsed.companyCode}-${parsed.plan}-${parsed.validTill.replace(/-/g, '')}`;
    const nextCompanies = companies.map((c) =>
      c.id === company!.id
        ? {
            ...c,
            activationKey: updatedKey,
            activationKeyStatus: 'active' as const,
            endDate: parsed.validTill,
            renewalRequested: false,
            status: 'active' as OrgStatus,
            lastRenewedAt: new Date().toISOString(),
          }
        : c
    );

    persistCompanies(nextCompanies);
    set((s) => ({
      companies: nextCompanies,
      audits: pushAudit(s.audits, {
        actor: company!.contactName || 'Supervisor',
        action: 'Activation key applied',
        companyCode: company!.code,
        detail: `Applied new key (${updatedKey}). Validity extended to ${parsed.validTill}`,
      }),
    }));

    return {
      success: true,
      message: `Activation key applied! Validity updated to ${parsed.validTill}.`,
      newEndDate: parsed.validTill,
    };
  },

  sendCredentials: (id) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return false;
    set((s) => ({
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Credentials sent',
        companyCode: company.code,
        detail: `Sent access credentials to ${company.contactEmail}`,
      }),
    }));
    return true;
  },

  impersonateCompany: (id) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    set((s) => ({
      impersonatedCompanyId: id,
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Impersonated tenant',
        companyCode: company.code,
        detail: `Switched context to ${company.name}`,
      }),
    }));
  },

  clearImpersonation: () => {
    set({ impersonatedCompanyId: null });
  },

  updateTrunkStatus: (id, status) => {
    set((s) => ({
      trunks: s.trunks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  },

  updateSettings: (patch) => {
    set((s) => ({
      settings: { ...s.settings, ...patch },
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Platform settings updated',
        companyCode: 'GLOBAL',
        detail: 'Updated platform settings',
      }),
    }));
  },
}));
