import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Sliders,
  Gauge,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Calendar,
  ExternalLink,
  UserCheck,
  RotateCcw,
  Check,
  ArrowRight,
  Radio,
  Server,
  Zap,
  Layers,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import { EMPTY_QUOTAS, PLANS, getPlan } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { Company, CompanyDraft, FeatureCode, Quotas } from '../types';

const STEPS = [
  { id: 0, label: 'Company Info', icon: Building2, desc: 'Name, legal & contact details' },
  { id: 1, label: 'Admin User', icon: User, desc: 'Initial tenant administrator' },
  { id: 2, label: 'Features & Modules', icon: Sliders, desc: 'CRM, dialer, IVR & AI modules' },
  { id: 3, label: 'Capacity Limits', icon: Gauge, desc: 'Seats, call minutes & storage' },
  { id: 4, label: 'Subscription', icon: CreditCard, desc: 'Plan selection & validity dates' },
  { id: 5, label: 'Review & Provision', icon: CheckCircle2, desc: 'Verify & activate tenant' },
];

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const initialDraft: CompanyDraft = {
  name: '',
  legalName: '',
  city: '',
  gst: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  adminPassword: 'Password@123',
  sendWelcomeEmail: true,
  features: [...(getPlan('calling')?.features ?? ['crm', 'allocation', 'calling', 'recordings', 'reports'])],
  quotas: { ...(getPlan('calling')?.quotas ?? EMPTY_QUOTAS) },
  planId: 'calling',
  billingCycle: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: addDays(new Date().toISOString().slice(0, 10), 30),
  graceDays: 3,
  autoLockOnExpiry: true,
};

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const addCompany = useSuperAdminStore((s) => s.addCompany);
  const impersonateCompany = useSuperAdminStore((s) => s.impersonateCompany);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CompanyDraft>(initialDraft);
  const [showPassword, setShowPassword] = useState(false);
  const [showProvisionedPass, setShowProvisionedPass] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Provisioning Progress State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [provisionStatusText, setProvisionStatusText] = useState('');
  const [createdCompany, setCreatedCompany] = useState<Company | null>(null);

  const selectedPlan = useMemo(() => getPlan(draft.planId), [draft.planId]);

  const patch = (p: Partial<CompanyDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchQuota = (p: Partial<Quotas>) =>
    setDraft((d) => ({ ...d, quotas: { ...d.quotas, ...p } }));

  const applyPlan = (planId: string) => {
    const next = getPlan(planId);
    if (!next) return;
    patch({
      planId,
      features: [...next.features],
      quotas: { ...next.quotas },
    });
  };

  const applyDurationPreset = (days: number) => {
    patch({
      endDate: addDays(draft.startDate, days),
    });
  };

  const canProceed = () => {
    if (step === 0) {
      return draft.name.trim().length >= 2 && draft.city.trim().length >= 2;
    }
    if (step === 1) {
      return (
        draft.contactName.trim().length >= 2 &&
        draft.contactEmail.includes('@') &&
        draft.contactEmail.includes('.') &&
        (draft.adminPassword?.length ?? 0) >= 6
      );
    }
    if (step === 2) {
      return draft.features.length > 0;
    }
    if (step === 3) {
      return draft.quotas.seats >= 1;
    }
    if (step === 4) {
      return !!draft.startDate && !!draft.endDate;
    }
    return true;
  };

  const handleCreateCompany = () => {
    setIsProvisioning(true);
    setProvisionProgress(20);
    setProvisionStatusText('Creating isolated database schema & tenant namespace...');

    setTimeout(() => {
      setProvisionProgress(50);
      setProvisionStatusText('Binding carrier SIP trunk channels & DID numbers...');
    }, 400);

    setTimeout(() => {
      setProvisionProgress(80);
      setProvisionStatusText('Generating cryptographic administrator credentials...');
    }, 800);

    setTimeout(() => {
      setProvisionProgress(100);
      setProvisionStatusText('Tenant workspace activated successfully!');
      
      const created = addCompany(draft);
      setCreatedCompany(created);
      setIsProvisioning(false);
      toast.success(`Tenant ${created.code} (${created.name}) provisioned & activated!`);
    }, 1300);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyFullBrief = () => {
    if (!createdCompany) return;
    const loginUrl = `${window.location.origin}/login?tenant=${createdCompany.code}`;
    const brief = `==============================
BNORBIT CRM - Tenant Access Credentials
==============================
Company: ${createdCompany.name}
Tenant Code: ${createdCompany.code}
Login URL: ${loginUrl}
Admin Email: ${createdCompany.contactEmail}
Initial Password: ${draft.adminPassword}
Plan: ${selectedPlan?.name} (${createdCompany.quotas.seats} Seats)
==============================`;

    navigator.clipboard.writeText(brief);
    toast.success('Complete access brief copied to clipboard');
  };

  const handleImpersonateTenant = () => {
    if (!createdCompany) return;
    impersonateCompany(createdCompany.id);
    toast.success(`Impersonating ${createdCompany.name} · Super Admin view`);
    navigate(`/superadmin/companies/${createdCompany.id}`);
  };

  const handleResetForNew = () => {
    setDraft(initialDraft);
    setCreatedCompany(null);
    setStep(0);
  };

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 7: POST-ACTIVATION SUCCESS & HANDOFF SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (createdCompany) {
    const loginUrl = `${window.location.origin}/login?tenant=${createdCompany.code}`;

    return (
      <div className="sa-page animate-fade-in">
        {/* Success Hero Header */}
        <div className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08), var(--bg-card))' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)' }}>
            <CheckCircle2 size={36} />
          </div>
          <div className="sa-badge-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <Sparkles size={13} /> Tenant Workspace Provisioned & Active
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '0.4rem 0 0.25rem', color: 'var(--text-primary)' }}>
            {createdCompany.name} is Live!
          </h1>
          <p className="sa-muted" style={{ fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto' }}>
            Company tenant space created under code <span className="sa-code-badge" style={{ fontSize: '0.85rem' }}>{createdCompany.code}</span>. All provisioned seats, SIP channels, and CRM modules are active.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImpersonateTenant}
            >
              <UserCheck size={16} /> Impersonate & Open Tenant Portal
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopyFullBrief}
            >
              <Copy size={16} /> Copy Access Brief
            </button>
            <Link
              to={`/superadmin/companies/${createdCompany.id}`}
              className="btn btn-outline"
            >
              Manage Profile <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Administrator Credentials & Dispatch */}
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-title">
                <Lock size={18} className="sa-text-indigo" /> Administrator Credentials & Login
              </h3>
              <span className="sa-stat-chip green">Active Credentials</span>
            </div>

            <div className="sa-creds-preview-card" style={{ gap: '0.75rem' }}>
              {/* Tenant Login URL */}
              <div className="sa-creds-row">
                <div>
                  <span className="sa-creds-label">Dedicated Tenant Login URL:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary-light)', marginTop: '2px', wordBreak: 'break-all' }}>
                    {loginUrl}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  onClick={() => handleCopy(loginUrl, 'url')}
                >
                  {copiedKey === 'url' ? <Check size={13} className="sa-text-success" /> : <Copy size={13} />} Copy URL
                </button>
              </div>

              {/* Admin Email */}
              <div className="sa-creds-row" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <span className="sa-creds-label">Admin Login Email:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {createdCompany.contactEmail}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  onClick={() => handleCopy(createdCompany.contactEmail, 'email')}
                >
                  {copiedKey === 'email' ? <Check size={13} className="sa-text-success" /> : <Copy size={13} />} Copy Email
                </button>
              </div>

              {/* Admin Password */}
              <div className="sa-creds-row" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <span className="sa-creds-label">Temporary Password:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {showProvisionedPass ? draft.adminPassword : '••••••••••••'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() => setShowProvisionedPass(!showProvisionedPass)}
                  >
                    {showProvisionedPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => handleCopy(draft.adminPassword || 'Password@123', 'pass')}
                  >
                    {copiedKey === 'pass' ? <Check size={13} className="sa-text-success" /> : <Copy size={13} />} Copy Pass
                  </button>
                </div>
              </div>
            </div>

            {/* Email Dispatch Notice */}
            <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem' }}>
              <Mail size={16} className="sa-text-success" style={{ flexShrink: 0 }} />
              <div>
                <strong>Onboarding Email Status:</strong>
                <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                  {draft.sendWelcomeEmail
                    ? `✓ Automated welcome dispatch with credentials sent to ${createdCompany.contactEmail}`
                    : 'Manual Dispatch: Email notifications were bypassed by super admin.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Provisioned Quotas & Governance Summary */}
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-title">
                <Gauge size={18} className="sa-text-indigo" /> Provisioned Boundaries & Plan
              </h3>
              <span className="sa-stat-chip indigo">{selectedPlan?.name}</span>
            </div>

            <div className="sa-review-block" style={{ marginBottom: '0.75rem' }}>
              <div className="sa-review-item">
                <span>Tenant ID & Code:</span>
                <strong>{createdCompany.id} ({createdCompany.code})</strong>
              </div>
              <div className="sa-review-item">
                <span>Total Licensed Seats:</span>
                <strong>{createdCompany.quotas.seats} Seats ({createdCompany.quotas.telecallers} Telecallers)</strong>
              </div>
              <div className="sa-review-item">
                <span>Monthly Call Minutes:</span>
                <strong>{createdCompany.quotas.monthlyMinutes.toLocaleString('en-IN')} mins</strong>
              </div>
              <div className="sa-review-item">
                <span>Storage Allocation:</span>
                <strong>{createdCompany.quotas.storageGb} GB</strong>
              </div>
              <div className="sa-review-item">
                <span>Subscription Validity:</span>
                <strong>{createdCompany.startDate} → {createdCompany.endDate}</strong>
              </div>
              <div className="sa-review-item">
                <span>Grace Period & Auto-Lock:</span>
                <strong>{createdCompany.graceDays} Days ({createdCompany.autoLockOnExpiry ? 'Auto-Lock ON' : 'Disabled'})</strong>
              </div>
            </div>

            {/* Active Modules */}
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Active Modules ({createdCompany.features.length}):
              </span>
              <div className="sa-modules" style={{ marginTop: '0.4rem' }}>
                {createdCompany.features.map((code) => (
                  <span key={code} className="sa-mod active" style={{ fontSize: '0.72rem' }}>
                    ✓ {code.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="card" style={{ marginTop: '1.25rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/superadmin/companies')}
          >
            <ChevronLeft size={14} /> Back to Companies List
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetForNew}
            >
              <RotateCcw size={14} /> Provision Another Tenant
            </button>
            <Link
              to={`/superadmin/companies/${createdCompany.id}`}
              className="btn btn-primary btn-sm"
            >
              Open Company Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PROVISIONING PROGRESS SIMULATION OVERLAY
  // ═══════════════════════════════════════════════════════════════════════
  if (isProvisioning) {
    return (
      <div className="sa-page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Server size={28} className="spin-icon" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Provisioning Tenant Workspace...
          </h2>
          <p className="sa-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', minHeight: '24px' }}>
            {provisionStatusText}
          </p>

          {/* Progress Bar */}
          <div style={{ height: '8px', borderRadius: '9999px', background: 'var(--bg-tertiary)', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div
              style={{
                height: '100%',
                width: `${provisionProgress}%`,
                background: 'linear-gradient(90deg, #4f46e5, #10b981)',
                borderRadius: '9999px',
                transition: 'width 0.35s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Allocating Resources</span>
            <span>{provisionProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // WIZARD STEPS 1 TO 6
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="sa-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/superadmin/companies')}
            style={{ marginBottom: '0.5rem' }}
          >
            <ChevronLeft size={14} /> Back to Companies
          </button>
          <h1 className="page-title">
            <Building2 size={24} /> Create New Company Tenant
          </h1>
          <p className="page-subtitle">
            Provision a dedicated tenant workspace: company profile, admin user, enabled CRM modules, capacity quotas & subscription.
          </p>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="sa-wizard-steps-container">
        {STEPS.map((s, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;
          const StepIcon = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              className={`sa-wizard-step-item ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
              onClick={() => {
                if (idx <= step || canProceed()) {
                  setStep(idx);
                }
              }}
            >
              <div className="sa-wizard-step-icon-wrap">
                {isDone ? <CheckCircle2 size={16} /> : <StepIcon size={16} />}
              </div>
              <div className="sa-wizard-step-text">
                <span className="sa-wizard-step-num">Step {idx + 1}</span>
                <span className="sa-wizard-step-label">{s.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="card sa-wizard-card">
        {/* Step 1: Company Info */}
        {step === 0 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 1: Company & Legal Information</h3>
              <p className="sa-section-sub">
                Enter the primary organizational details for this tenant workspace.
              </p>
            </div>

            <div className="sa-form-grid">
              <label className="sa-field">
                <span>
                  Company Brand Name <strong className="sa-text-danger">*</strong>
                </span>
                <input
                  className="form-input"
                  placeholder="e.g. Apex Recoveries Pvt Ltd"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>Legal Entity / Registered Name</span>
                <input
                  className="form-input"
                  placeholder="e.g. Apex Recoveries & Financial Services Private Limited"
                  value={draft.legalName}
                  onChange={(e) => patch({ legalName: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>
                  Operating City / Region <strong className="sa-text-danger">*</strong>
                </span>
                <input
                  className="form-input"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={draft.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>GSTIN / Tax Identification (Optional)</span>
                <input
                  className="form-input"
                  placeholder="e.g. 27AABCU9603R1ZX"
                  value={draft.gst}
                  onChange={(e) => patch({ gst: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>Company Phone Number</span>
                <input
                  className="form-input"
                  placeholder="e.g. +91 98200 11042"
                  value={draft.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>Billing / Contact Email</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. accounts@apexrecoveries.in"
                  value={draft.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Admin User */}
        {step === 1 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 2: Company Administrator User</h3>
              <p className="sa-section-sub">
                This administrator will receive full control over this tenant to create supervisors, add telecallers, and configure campaign allocations.
              </p>
            </div>

            <div className="sa-form-grid">
              <label className="sa-field">
                <span>
                  Admin Full Name <strong className="sa-text-danger">*</strong>
                </span>
                <input
                  className="form-input"
                  placeholder="e.g. Rohit Mehta"
                  value={draft.contactName}
                  onChange={(e) => patch({ contactName: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>
                  Admin Login Email <strong className="sa-text-danger">*</strong>
                </span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rohit.mehta@apexrecoveries.in"
                  value={draft.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>
                  Initial Admin Password <strong className="sa-text-danger">*</strong>
                </span>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    value={draft.adminPassword}
                    onChange={(e) => patch({ adminPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <label className="sa-field">
                <span>Admin Mobile (for OTP / Alerts)</span>
                <input
                  className="form-input"
                  placeholder="e.g. +91 98200 11042"
                  value={draft.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                />
              </label>

              <div className="sa-field full" style={{ marginTop: '0.5rem' }}>
                <label className="sa-checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.sendWelcomeEmail}
                    onChange={(e) => patch({ sendWelcomeEmail: e.target.checked })}
                  />
                  <span>
                    <strong>Send Onboarding Email with Login Credentials</strong>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Automatically emails the login URL, administrator username, and temporary password to {draft.contactEmail || 'the admin email'}.
                    </small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Features & Modules */}
        {step === 2 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 3: Module & Feature Activation</h3>
              <p className="sa-section-sub">
                Select which modules are accessible by this company. Dependent modules will automatically toggle on.
              </p>
            </div>

            <FeatureChecklist
              value={draft.features}
              onChange={(features: FeatureCode[]) => patch({ features })}
            />
          </div>
        )}

        {/* Step 4: Capacity Limits & Quotas */}
        {step === 3 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 4: Provision Capacity Limits</h3>
              <p className="sa-section-sub">
                Define the maximum resource boundaries allocated to this company tenant.
              </p>
            </div>

            <div className="sa-form-grid">
              <label className="sa-field">
                <span>Total Licensed Seats (Overall Users)</span>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={draft.quotas.seats}
                  onChange={(e) => patchQuota({ seats: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field">
                <span>Telecaller Floor Agent Quota</span>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={draft.quotas.telecallers}
                  onChange={(e) => patchQuota({ telecallers: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field">
                <span>Supervisors / Team Leads</span>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={draft.quotas.supervisors}
                  onChange={(e) => patchQuota({ supervisors: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field">
                <span>Concurrent Live Dialer Channels</span>
                <input
                  type="number"
                  min={0}
                  className="form-input"
                  value={draft.quotas.concurrentAgents}
                  onChange={(e) => patchQuota({ concurrentAgents: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field">
                <span>Monthly Call Minutes Allowance</span>
                <input
                  type="number"
                  step={5000}
                  min={0}
                  className="form-input"
                  value={draft.quotas.monthlyMinutes}
                  onChange={(e) => patchQuota({ monthlyMinutes: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field">
                <span>Encrypted Audio / Doc Storage (GB)</span>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={draft.quotas.storageGb}
                  onChange={(e) => patchQuota({ storageGb: Number(e.target.value) })}
                />
              </label>

              <label className="sa-field full">
                <span>Customer / Loan Records Cap</span>
                <input
                  type="number"
                  step={10000}
                  min={1000}
                  className="form-input"
                  value={draft.quotas.records}
                  onChange={(e) => patchQuota({ records: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Subscription Plan & Validity */}
        {step === 4 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 5: Select Plan & Subscription Period</h3>
              <p className="sa-section-sub">
                Choose a pre-configured SaaS package or customize validity and auto-lock rules.
              </p>
            </div>

            {/* Plan Cards Grid */}
            <div className="sa-plan-grid">
              {PLANS.map((p) => {
                const isSelected = draft.planId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`sa-plan-card ${isSelected ? 'on' : ''}`}
                    onClick={() => applyPlan(p.id)}
                  >
                    {p.isPopular && <span className="sa-popular-tag">Recommended</span>}
                    <h3>{p.name}</h3>
                    <p className="sa-muted">{p.tagline}</p>
                    <div className="sa-plan-price">
                      {p.custom ? 'Custom Billing' : `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo`}
                    </div>
                    <div className="sa-plan-features-preview">
                      <span className="sa-plan-feat-item">✓ {p.quotas.seats} Seats Included</span>
                      <span className="sa-plan-feat-item">✓ {p.quotas.monthlyMinutes.toLocaleString('en-IN')} Call Min</span>
                      <span className="sa-plan-feat-item">✓ {p.features.length} Enabled Modules</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Validity Presets & Dates */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Quick Duration Presets:</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-xs btn-secondary" onClick={() => applyDurationPreset(14)}>
                    14-Day Free Trial
                  </button>
                  <button type="button" className="btn btn-xs btn-secondary" onClick={() => applyDurationPreset(30)}>
                    1 Month
                  </button>
                  <button type="button" className="btn btn-xs btn-secondary" onClick={() => applyDurationPreset(90)}>
                    3 Months (Quarterly)
                  </button>
                  <button type="button" className="btn btn-xs btn-secondary" onClick={() => applyDurationPreset(365)}>
                    1 Year (Annual)
                  </button>
                </div>
              </div>

              <div className="sa-form-grid">
                <label className="sa-field">
                  <span>Subscription Start Date</span>
                  <input
                    type="date"
                    className="form-input"
                    value={draft.startDate}
                    onChange={(e) => patch({ startDate: e.target.value })}
                  />
                </label>

                <label className="sa-field">
                  <span>Subscription Expiry Date</span>
                  <input
                    type="date"
                    className="form-input"
                    value={draft.endDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                  />
                </label>

                <label className="sa-field">
                  <span>Grace Period Days (Before Auto-Lock)</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    className="form-input"
                    value={draft.graceDays}
                    onChange={(e) => patch({ graceDays: Number(e.target.value) })}
                  />
                </label>

                <div className="sa-field" style={{ justifyContent: 'center' }}>
                  <label className="sa-checkbox-label">
                    <input
                      type="checkbox"
                      checked={draft.autoLockOnExpiry}
                      onChange={(e) => patch({ autoLockOnExpiry: e.target.checked })}
                    />
                    <span>
                      <strong>Enforce Tenant Auto-Lock upon Expiry</strong>
                      <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                        Blocks agent & supervisor logins after grace period expires.
                      </small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Provision */}
        {step === 5 && (
          <div className="sa-wizard-section animate-fade-in">
            <div className="sa-section-intro">
              <h3 className="sa-section-title">Step 6: Review Tenant Specification</h3>
              <p className="sa-section-sub">
                Confirm all parameters before provisioning this tenant workspace into the BNORBIT platform.
              </p>
            </div>

            <div className="sa-review-summary-card">
              <div className="sa-review-grid">
                <div className="sa-review-block">
                  <h4 className="sa-review-block-title">
                    <Building2 size={16} /> Company & Legal
                  </h4>
                  <div className="sa-review-item">
                    <span>Company Name:</span>
                    <strong>{draft.name}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Legal Name:</span>
                    <strong>{draft.legalName || draft.name}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>City / Region:</span>
                    <strong>{draft.city}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>GSTIN:</span>
                    <strong>{draft.gst || 'Not Specified'}</strong>
                  </div>
                </div>

                <div className="sa-review-block">
                  <h4 className="sa-review-block-title">
                    <User size={16} /> Administrator Access
                  </h4>
                  <div className="sa-review-item">
                    <span>Admin Name:</span>
                    <strong>{draft.contactName}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Login Email:</span>
                    <strong>{draft.contactEmail}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Phone:</span>
                    <strong>{draft.contactPhone || '—'}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Email Credentials:</span>
                    <strong className="sa-text-success">
                      {draft.sendWelcomeEmail ? 'Yes (Auto-send)' : 'Manual Dispatch'}
                    </strong>
                  </div>
                </div>

                <div className="sa-review-block">
                  <h4 className="sa-review-block-title">
                    <CreditCard size={16} /> Subscription & Validity
                  </h4>
                  <div className="sa-review-item">
                    <span>Plan Package:</span>
                    <strong>{selectedPlan?.name ?? draft.planId}</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Period:</span>
                    <strong>
                      {draft.startDate} → {draft.endDate}
                    </strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Grace Period:</span>
                    <strong>{draft.graceDays} Days</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Auto-Lock on Expiry:</span>
                    <strong>{draft.autoLockOnExpiry ? 'Enabled' : 'Disabled'}</strong>
                  </div>
                </div>

                <div className="sa-review-block">
                  <h4 className="sa-review-block-title">
                    <Gauge size={16} /> Resource Boundaries
                  </h4>
                  <div className="sa-review-item">
                    <span>Total Seats:</span>
                    <strong>{draft.quotas.seats} Seats</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Telecallers / Supervisors:</span>
                    <strong>
                      {draft.quotas.telecallers} / {draft.quotas.supervisors}
                    </strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Monthly Call Minutes:</span>
                    <strong>{draft.quotas.monthlyMinutes.toLocaleString('en-IN')} mins</strong>
                  </div>
                  <div className="sa-review-item">
                    <span>Storage Allocation:</span>
                    <strong>{draft.quotas.storageGb} GB</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Enabled Modules ({draft.features.length}):
                </h4>
                <div className="sa-modules">
                  {draft.features.map((code) => (
                    <span key={code} className="sa-mod active">
                      ✓ {code.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="sa-wizard-nav">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft size={16} /> Previous Step
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canProceed()}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg sa-glow-btn"
                onClick={handleCreateCompany}
              >
                <Sparkles size={16} /> Provision & Activate Tenant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
