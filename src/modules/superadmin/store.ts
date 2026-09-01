import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog, Company, CompanyDraft, FeatureCode, OrgStatus, PlatformSettings, Quotas, TelephonyTrunk } from './types';
import { DEFAULT_PLATFORM_SETTINGS, TELEPHONY_TRUNKS, getPlan } from './data/catalog';
import { seedAudits, seedCompanies } from './data/mock';

interface SuperAdminState {
  companies: Company[];
  audits: AuditLog[];
  trunks: TelephonyTrunk[];
  settings: PlatformSettings;
  impersonatedCompanyId: string | null;

  // Actions
  addCompany: (draft: CompanyDraft) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  setFeatures: (id: string, features: FeatureCode[]) => void;
  setQuotas: (id: string, quotas: Quotas) => void;
  setStatus: (id: string, status: OrgStatus, detail: string) => void;
  extendDays: (id: string, days: number) => void;
  sendCredentials: (id: string) => boolean;
  impersonateCompany: (id: string) => void;
  clearImpersonation: () => void;
  updateTrunkStatus: (id: string, status: TelephonyTrunk['status']) => void;
  updateSettings: (patch: Partial<PlatformSettings>) => void;
  deleteCompany: (id: string) => void;
}

function nextCode(companies: Company[]) {
  const nums = companies.map((c) => Number(c.code.replace('BN-', ''))).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `BN-${next}`;
}

function pushAudit(audits: AuditLog[], entry: Omit<AuditLog, 'id' | 'at'>): AuditLog[] {
  return [
    {
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      ...entry,
    },
    ...audits,
  ];
}

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      companies: seedCompanies,
      audits: seedAudits,
      trunks: TELEPHONY_TRUNKS,
      settings: DEFAULT_PLATFORM_SETTINGS,
      impersonatedCompanyId: null,

      addCompany: (draft) => {
        const plan = getPlan(draft.planId);
        const code = nextCode(get().companies);
        const company: Company = {
          id: `org-${Date.now()}`,
          code,
          name: draft.name,
          legalName: draft.legalName || draft.name,
          city: draft.city,
          gst: draft.gst,
          contactName: draft.contactName,
          contactEmail: draft.contactEmail,
          contactPhone: draft.contactPhone,
          status: 'trial',
          planId: draft.planId,
          billingCycle: draft.billingCycle || 'monthly',
          autoLockOnExpiry: draft.autoLockOnExpiry ?? true,
          features: draft.features.length ? draft.features : (plan?.features ?? ['crm', 'reports']),
          quotas: draft.quotas,
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
          startDate: draft.startDate,
          endDate: draft.endDate,
          graceDays: draft.graceDays ?? 3,
          lastLogin: null,
          createdAt: new Date().toISOString(),
        };

        set((s) => ({
          companies: [company, ...s.companies],
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Company provisioned',
            companyCode: company.code,
            detail: `${company.name} · ${plan?.name ?? 'Custom'} · Admin ${company.contactEmail}`,
            category: 'company',
          }),
        }));

        return company;
      },

      updateCompany: (id, patch) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Company details updated',
            companyCode: company.code,
            detail: `Updated profile for ${company.name}`,
            category: 'company',
          }),
        }));
      },

      setFeatures: (id, features) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, features } : c)),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Modules updated',
            companyCode: company.code,
            detail: `Enabled: ${features.join(', ') || 'None'}`,
            category: 'modules',
          }),
        }));
      },

      setQuotas: (id, quotas) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, quotas } : c)),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Capacity limits updated',
            companyCode: company.code,
            detail: `${quotas.seats} seats · ${quotas.telecallers} telecallers · ${quotas.monthlyMinutes.toLocaleString('en-IN')} mins`,
            category: 'limits',
          }),
        }));
      },

      setStatus: (id, status, detail) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, status } : c)),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: status === 'active' ? 'Reactivated' : status === 'suspended' ? 'Suspended' : `Status changed to ${status}`,
            companyCode: company.code,
            detail,
            category: status === 'suspended' ? 'security' : 'subscription',
          }),
        }));
      },

      extendDays: (id, days) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        const end = new Date(company.endDate);
        end.setDate(end.getDate() + days);
        const endDate = end.toISOString().slice(0, 10);
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, endDate, status: c.status === 'expired' ? 'active' : c.status } : c)),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: `Extended +${days} days`,
            companyCode: company.code,
            detail: `Validity pushed to ${endDate}`,
            category: 'subscription',
          }),
        }));
      },

      sendCredentials: (id) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return false;
        set((s) => ({
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Credentials dispatched',
            companyCode: company.code,
            detail: `Sent password setup & portal access to ${company.contactEmail}`,
            category: 'security',
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
            actor: 'Super Admin',
            action: 'Started Impersonation',
            companyCode: company.code,
            detail: `Switched view context to ${company.name}`,
            category: 'security',
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
            actor: 'Super Admin',
            action: 'Platform settings changed',
            companyCode: 'GLOBAL',
            detail: 'Updated platform security/defaults configuration',
            category: 'system',
          }),
        }));
      },

      deleteCompany: (id) => {
        const company = get().companies.find((c) => c.id === id);
        if (!company) return;
        set((s) => ({
          companies: s.companies.filter((c) => c.id !== id),
          audits: pushAudit(s.audits, {
            actor: 'Super Admin',
            action: 'Company deleted',
            companyCode: company.code,
            detail: `Purged tenant ${company.name}`,
            category: 'company',
          }),
        }));
      },
    }),
    {
      name: 'bnorbit-superadmin-store',
    }
  )
);
