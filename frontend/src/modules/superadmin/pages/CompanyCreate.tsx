import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Calculator,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import { FEATURE_CATALOG } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import { generateActivationKey, generateStrongPassword, generateLoginEmail } from '../utils/activationKey';
import type { CompanyDraft, FeatureCode } from '../types';

const STEPS = ['Company', 'Owner admin', 'Modules', 'Limits & Billing', 'Review & Key'];

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const DEFAULT_ALL_MODULES: FeatureCode[] = [
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
];

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const addCompany = useSuperAdminStore((s) => s.addCompany);

  const today = new Date().toISOString().slice(0, 10);
  const oneMonthLater = addDays(today, 30);

  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [loginDigits, setLoginDigits] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const [draft, setDraft] = useState<CompanyDraft>({
    name: '',
    legalName: '',
    city: '',
    gst: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    adminPassword: generateStrongPassword('Orbit'),
    features: DEFAULT_ALL_MODULES,
    pricePerUser: 2000,
    totalMonthlyBilling: 20000,
    paymentStatus: 'internal',
    quotas: {
      seats: 10,
      telecallers: 10,
      supervisors: 2,
      concurrentAgents: 10,
      monthlyMinutes: 20000,
      storageGb: 20,
      records: 30000,
    },
    startDate: today,
    endDate: oneMonthLater,
    graceDays: 3,
  });

  const patch = (p: Partial<CompanyDraft>) => setDraft((d) => ({ ...d, ...p }));

  // Handle User-based limits and billing recalculation
  const handleUserCountChange = (users: number) => {
    const validUsers = Math.max(1, users || 1);
    const price = draft.pricePerUser || 2000;
    const total = validUsers * price;

    setDraft((d) => ({
      ...d,
      totalMonthlyBilling: total,
      quotas: {
        ...d.quotas,
        seats: validUsers,
        telecallers: validUsers,
        concurrentAgents: validUsers,
      },
    }));
  };

  const handlePricePerUserChange = (price: number) => {
    const validPrice = Math.max(0, price || 0);
    const users = draft.quotas.telecallers || 10;
    const total = users * validPrice;

    setDraft((d) => ({
      ...d,
      pricePerUser: validPrice,
      totalMonthlyBilling: total,
    }));
  };

  const handleGenerateNewPassword = () => {
    const nextPassword = generateStrongPassword(draft.name || 'Orbit');
    patch({ adminPassword: nextPassword });
    toast.success('Generated secure password');
  };

  // Generate dedicated CRM portal login email (format: admin@company####.com)
  const computedLoginEmail =
    draft.loginEmail ||
    generateLoginEmail(draft.contactName || 'admin', draft.name || 'company', loginDigits);

  const handleRegenerateLoginEmail = () => {
    const nextDigits = Math.floor(1000 + Math.random() * 9000).toString();
    setLoginDigits(nextDigits);
    const newEmail = generateLoginEmail(draft.contactName || 'admin', draft.name || 'company', nextDigits);
    patch({ loginEmail: newEmail });
    toast.success(`Generated portal login email: ${newEmail}`);
  };

  // Generate activation key based on company name, plan (IVR / CRM), and valid till date
  const hasIvr = draft.features.some((f) => f.startsWith('ivr_') || f === 'call_recordings');
  const planTag = hasIvr ? 'IVR' : 'CRM';
  const activationKey =
    draft.activationKey ||
    generateActivationKey(draft.name || 'UDAAN', planTag, draft.endDate);

  const canNext = () => {
    if (step === 0) return draft.name.trim().length > 1 && draft.city.trim().length > 1;
    if (step === 1) {
      return (
        draft.contactName.trim().length > 0 &&
        draft.contactEmail.includes('@') &&
        Boolean(computedLoginEmail && computedLoginEmail.includes('@')) &&
        Boolean(draft.adminPassword && draft.adminPassword.trim().length >= 6)
      );
    }
    if (step === 2) return draft.features.length > 0;
    if (step === 3) return (draft.quotas.telecallers || 0) > 0;
    return true;
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(activationKey);
    setCopiedKey(true);
    toast.success('Activation key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCompleteInvite = () => {
    const inviteText = `==============================
BNORBIT CRM - ACCESS CREDENTIALS
==============================
Company Name   : ${draft.name} (${draft.city})
Admin Name     : ${draft.contactName}
Login Email    : ${computedLoginEmail}
Admin Password : ${draft.adminPassword}
Portal URL     : ${window.location.origin}/login

Contact Email  : ${draft.contactEmail}
ACTIVATION KEY : ${activationKey}
Authorized Users: ${draft.quotas.telecallers} Telecaller IDs
Billing Mode   : Internal Billing (₹${(draft.totalMonthlyBilling || 0).toLocaleString('en-IN')}/mo)
Valid Till     : ${draft.endDate}
Active Modules : ${draft.features.length} Modules Included
==============================
Supervisor Profile me ja kar Activation Key enter karein to activate all modules and user slots.`;

    navigator.clipboard.writeText(inviteText);
    setCopiedAll(true);
    toast.success('Full credentials & activation key copied!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const submit = () => {
    try {
      const userCount = draft.quotas?.telecallers || draft.quotas?.seats || 10;
      const userPrice = draft.pricePerUser || 2000;
      const finalPayload: CompanyDraft = {
        ...draft,
        loginEmail: computedLoginEmail,
        activationKey,
        totalMonthlyBilling: draft.totalMonthlyBilling != null ? draft.totalMonthlyBilling : userCount * userPrice,
      };

      const company = addCompany(finalPayload);
      toast.success(`Company ${company.code} created successfully with login ${computedLoginEmail}!`);
      navigate(`/superadmin/companies/${company.id}`);
    } catch (err: any) {
      console.error('Failed to create company:', err);
      toast.error(err?.message || 'Failed to create company. Please verify input fields.');
    }
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title"><Building2 size={24} /> New Company Provisioning</h1>
          <p className="page-subtitle">
            Configure company details, admin credentials, supervisor modules, user-based pricing & 16-digit activation key.
          </p>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="sa-steps" style={{ marginBottom: '1.5rem' }}>
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`sa-step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => {
              if (i < step || canNext()) setStep(i);
            }}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.75rem' }}>
        {/* ─── STEP 1: COMPANY DETAILS ─── */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                1. Company Identification
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Enter the primary registration and operational details of the recovery agency or enterprise.
              </p>
            </div>

            <div className="sa-form-grid" style={{ gap: '1.25rem' }}>
              <label className="sa-field">
                <span>Company Name *</span>
                <input
                  className="form-input"
                  placeholder="e.g. Apex Recoveries Ltd"
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>Legal / Registered Name</span>
                <input
                  className="form-input"
                  placeholder="e.g. Apex Financial Solutions Pvt Ltd"
                  value={draft.legalName}
                  onChange={(e) => patch({ legalName: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>Operating City *</span>
                <input
                  className="form-input"
                  placeholder="e.g. New Delhi / Mumbai"
                  value={draft.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>GST Number (Optional)</span>
                <input
                  className="form-input"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={draft.gst}
                  onChange={(e) => patch({ gst: e.target.value.toUpperCase() })}
                />
              </label>
            </div>
          </div>
        )}

        {/* ─── STEP 2: OWNER ADMIN & PASSWORD ─── */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                2. Owner Admin Credentials
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Set up the primary Supervisor / Company Admin login credentials. They will use these to sign in and apply the activation key.
              </p>
            </div>

            <div className="sa-form-grid" style={{ gap: '1.25rem' }}>
              <label className="sa-field">
                <span>Admin Full Name *</span>
                <input
                  className="form-input"
                  placeholder="e.g. anjali"
                  value={draft.contactName}
                  onChange={(e) => patch({ contactName: e.target.value })}
                  required
                />
              </label>

              <label className="sa-field">
                <span>Contact Email Address *</span>
                <input
                  className="form-input"
                  type="email"
                  placeholder="e.g. anjali@gmail.com"
                  value={draft.contactEmail}
                  onChange={(e) => patch({ contactEmail: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Official notification email where credentials & activation key will be delivered.
                </span>
              </label>

              {/* Dedicated CRM Portal Login Email */}
              <div className="sa-field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Key size={14} className="text-primary" /> Generated CRM Login Email *
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateLoginEmail}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Sparkles size={12} /> Regenerate
                  </button>
                </div>
                <input
                  className="form-input"
                  type="email"
                  value={draft.loginEmail !== undefined ? draft.loginEmail : computedLoginEmail}
                  onChange={(e) => patch({ loginEmail: e.target.value })}
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1.5px solid rgba(99, 102, 241, 0.3)',
                  }}
                  required
                />
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Format: <strong>adminname@companyname####.com</strong> — Supervisor will use this ID to sign in to the portal.
                </span>
              </div>

              <label className="sa-field">
                <span>Contact Phone Number</span>
                <input
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={draft.contactPhone}
                  onChange={(e) => patch({ contactPhone: e.target.value })}
                />
              </label>

              {/* Admin Password Input with View/Hide & Generate */}
              <div className="sa-field" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Admin Login Password *</span>
                  <button
                    type="button"
                    onClick={handleGenerateNewPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Sparkles size={12} /> Generate Password
                  </button>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter or generate strong password"
                    value={draft.adminPassword || ''}
                    onChange={(e) => patch({ adminPassword: e.target.value })}
                    style={{ paddingRight: '2.5rem', fontFamily: showPassword ? 'inherit' : 'monospace' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  This password will be sent with the 16-digit activation key for initial portal login.
                </small>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <UserCheck size={20} color="var(--accent-primary)" />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <strong>Role note:</strong> This admin account will have Supervisor access to create telecallers, assign campaigns, and monitor recovery collections.
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: SUPERVISOR MODULES ─── */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                3. Modules & Feature Permissions
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Select the exact supervisor portal modules that will be unlocked when this tenant enters their activation key.
              </p>
            </div>

            <FeatureChecklist
              value={draft.features}
              onChange={(features: FeatureCode[]) => patch({ features })}
            />
          </div>
        )}

        {/* ─── STEP 4: LIMITS & USER-BASED BILLING ─── */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                4. User Capacity & Billing Structure
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Subscription is billed on a per-user basis. Specify the total authorized telecaller accounts and rate per user.
              </p>
            </div>

            {/* Dynamic Pricing Calculation Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                border: '1.5px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Calculator size={20} color="var(--accent-primary)" />
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  User-Based Monthly Billing Breakdown
                </strong>
                <span className="badge badge-warning" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  Internal Offline Billing
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1.25rem', alignItems: 'center' }}>
                <label className="sa-field">
                  <span>Total Users (Telecallers) *</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={500}
                    value={draft.quotas.telecallers}
                    onChange={(e) => handleUserCountChange(Number(e.target.value))}
                    style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Supervisor can create up to this limit
                  </small>
                </label>

                <label className="sa-field">
                  <span>Price Per User / Mo (₹) *</span>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={100}
                    value={draft.pricePerUser}
                    onChange={(e) => handlePricePerUserChange(Number(e.target.value))}
                    style={{ fontSize: '1.1rem', fontWeight: 700 }}
                  />
                  <small style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Standard rate: ₹2,000 / seat
                  </small>
                </label>

                <div
                  style={{
                    background: 'var(--bg-card)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Total Monthly Billed Amount
                  </div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 800,
                      color: 'var(--accent-primary)',
                      margin: '0.25rem 0',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ₹{(draft.totalMonthlyBilling || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                    {draft.quotas.telecallers} Users × ₹{(draft.pricePerUser || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Validity Duration & Capacity Quotas */}
            <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <label className="sa-field">
                <span>Start Date</span>
                <input
                  className="form-input"
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => patch({ startDate: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>Valid Till (1 Month)</span>
                <input
                  className="form-input"
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => patch({ endDate: e.target.value })}
                />
              </label>

              <label className="sa-field">
                <span>Grace Window (Days)</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={draft.graceDays}
                  onChange={(e) => patch({ graceDays: Number(e.target.value) })}
                />
              </label>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                Additional Tenant Quotas
              </span>
              <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <label className="sa-field">
                  <span>Supervisor Accounts</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={draft.quotas.supervisors}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, quotas: { ...d.quotas, supervisors: Number(e.target.value) } }))
                    }
                  />
                </label>

                <label className="sa-field">
                  <span>Concurrent Lines</span>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={draft.quotas.concurrentAgents}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, quotas: { ...d.quotas, concurrentAgents: Number(e.target.value) } }))
                    }
                  />
                </label>

                <label className="sa-field">
                  <span>Max Records Limit</span>
                  <input
                    className="form-input"
                    type="number"
                    step={5000}
                    min={1000}
                    value={draft.quotas.records}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, quotas: { ...d.quotas, records: Number(e.target.value) } }))
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 5: REVIEW & 16-DIGIT ACTIVATION KEY ─── */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                5. Review Details & Activation Key
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                Review all configuration parameters and copy the 16-digit activation key along with credentials to dispatch to the supervisor.
              </p>
            </div>

            {/* Prominent 16-Digit Activation Key Display */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                border: '2px dashed var(--accent-success)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <Key size={16} /> 16-DIGIT ACTIVATION KEY GENERATED
              </div>

              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: 'var(--text-primary)',
                  margin: '0.35rem 0 0.75rem',
                }}
              >
                {activationKey}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyKey}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                >
                  {copiedKey ? <CheckCircle2 size={14} color="var(--accent-success)" /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Key Copied!' : 'Copy Key Only'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCopyCompleteInvite}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                >
                  {copiedAll ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  <span>{copiedAll ? 'All Credentials Copied!' : 'Copy Complete Credentials'}</span>
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                🔑 Format: <strong>[COMPANY]-[PLAN]-[VALID TILL]</strong>. Supervisor profile me ye key enter karne par exactly <strong>{draft.quotas.telecallers} telecaller user IDs</strong> aur authorized modules unlock ho jayenge.
              </div>
            </div>

            {/* Review Grid */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Company & City</span>
                <strong style={{ color: 'var(--text-primary)' }}>{draft.name}</strong> ({draft.city})
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Owner Admin</span>
                <strong style={{ color: 'var(--text-primary)' }}>{draft.contactName}</strong>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Contact: {draft.contactEmail}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Portal Login Email</span>
                <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{computedLoginEmail}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Admin Password</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{draft.adminPassword}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>User Capacity Limit</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>
                  {draft.quotas.telecallers} Telecaller Users
                </strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> (+ {draft.quotas.supervisors} Sup)</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Monthly Billed Amount</span>
                <strong style={{ color: 'var(--accent-success)' }}>
                  ₹{(draft.totalMonthlyBilling || 0).toLocaleString('en-IN')} / month
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> (Internal Offline)</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Validity Period</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {draft.startDate} to {draft.endDate}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> (1 Month · {draft.graceDays}d grace)</span>
              </div>
            </div>

            {/* Selected Modules Badges */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Authorized Supervisor Modules ({draft.features.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {draft.features.map((code) => {
                  const def = FEATURE_CATALOG.find((f) => f.code === code);
                  const isIvr = code.startsWith('ivr_') || code === 'call_recordings';
                  return (
                    <span
                      key={code}
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: isIvr ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                        color: isIvr ? 'var(--accent-primary-light)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={11} />
                      {def?.label || code}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div
          className="sa-wizard-nav"
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canNext()}
              onClick={() => setStep((s) => s + 1)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                padding: '0.65rem 1.25rem',
                background: 'var(--accent-success)',
                borderColor: 'var(--accent-success)',
              }}
            >
              <CheckCircle2 size={18} /> Create Company
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
