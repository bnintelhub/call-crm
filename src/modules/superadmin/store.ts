import { create } from 'zustand';
import type { AuditLog, Company, CompanyDraft, FeatureCode, OrgStatus, Quotas } from './types';
import { getPlan } from './data/catalog';
import { seedAudits, seedCompanies } from './data/mock';

interface SuperAdminState {
  companies: Company[];
  audits: AuditLog[];
  addCompany: (draft: CompanyDraft) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  setFeatures: (id: string, features: FeatureCode[]) => void;
  setQuotas: (id: string, quotas: Quotas) => void;
  setStatus: (id: string, status: OrgStatus, detail: string) => void;
  extendDays: (id: string, days: number) => void;
}

function nextCode(companies: Company[]) {
  const nums = companies.map((c) => Number(c.code.replace('BN-', ''))).filter((n) => !Number.isNaN(n));
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
  companies: seedCompanies,
  audits: seedAudits,

  addCompany: (draft) => {
    const plan = getPlan(draft.planId);
    const company: Company = {
      id: `org-${Date.now()}`,
      code: nextCode(get().companies),
      name: draft.name,
      legalName: draft.legalName || draft.name,
      city: draft.city,
      gst: draft.gst,
      contactName: draft.contactName,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      status: 'trial',
      planId: draft.planId,
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
      graceDays: draft.graceDays,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      companies: [company, ...s.companies],
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: 'Company created',
        companyCode: company.code,
        detail: `${company.name} · ${plan?.name ?? 'Custom'} · admin ${company.contactEmail}`,
      }),
    }));

    return company;
  },

  updateCompany: (id, patch) => {
    set((s) => ({
      companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  setFeatures: (id, features) => {
    const company = get().companies.find((c) => c.id === id);
    if (!company) return;
    set((s) => ({
      companies: s.companies.map((c) => (c.id === id ? { ...c, features } : c)),
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
    set((s) => ({
      companies: s.companies.map((c) => (c.id === id ? { ...c, quotas } : c)),
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
    set((s) => ({
      companies: s.companies.map((c) => (c.id === id ? { ...c, status } : c)),
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: status === 'active' ? 'Reactivated' : status === 'suspended' ? 'Suspended' : 'Status changed',
        companyCode: company.code,
        detail,
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
      companies: s.companies.map((c) => (c.id === id ? { ...c, endDate, status: 'active' } : c)),
      audits: pushAudit(s.audits, {
        actor: 'You',
        action: `Extended ${days} days`,
        companyCode: company.code,
        detail: `New end date ${endDate}`,
      }),
    }));
  },
}));
