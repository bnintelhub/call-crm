import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  Key,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Send,
  PowerOff,
  Play,
  Trash2,
  Ban,
  AlertTriangle,
  X,
  RotateCw,
  BellRing,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import QuotaBar from '../components/QuotaBar';
import SendCredentialsModal from '../components/SendCredentialsModal';
import RenewCompanyModal from '../components/RenewCompanyModal';
import { StatusBadge, daysUntil, formatWhen } from '../components/format';
import { FEATURE_CATALOG, getPlan } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import { generateActivationKey, generateLoginEmail } from '../utils/activationKey';
import type { FeatureCode, Quotas } from '../types';

const TABS = ['Overview', 'Modules', 'Limits', 'Subscription', 'Usage', 'Audit'] as const;

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = useSuperAdminStore((s) => s.companies.find((c) => c.id === id));
  const allAudits = useSuperAdminStore((s) => s.audits);
  const audits = useMemo(() => {
    if (!company?.code) return [];
    return allAudits.filter((a) => a.companyCode === company.code);
  }, [allAudits, company?.code]);
  const setFeatures = useSuperAdminStore((s) => s.setFeatures);
  const setQuotas = useSuperAdminStore((s) => s.setQuotas);
  const setStatus = useSuperAdminStore((s) => s.setStatus);
  const stopCompany = useSuperAdminStore((s) => s.stopCompany);
  const resumeCompany = useSuperAdminStore((s) => s.resumeCompany);
  const deleteCompany = useSuperAdminStore((s) => s.deleteCompany);
  const extendDays = useSuperAdminStore((s) => s.extendDays);

  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [features, setLocalFeatures] = useState<FeatureCode[]>(company?.features ?? []);
  const [quotas, setLocalQuotas] = useState<Quotas | null>(company?.quotas ?? null);
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLoginEmail, setCopiedLoginEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!company) return;
    setLocalFeatures(company.features || []);
    setLocalQuotas(company.quotas || null);
    setTab('Overview');
  }, [company?.id]);

  if (!company) {
    return (
      <div className="sa-page animate-fade-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Company Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The requested company ID could not be found or may have been removed.
        </p>
        <Link to="/superadmin/companies" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ChevronLeft size={16} /> Back to Companies
        </Link>
      </div>
    );
  }

  const activeQuotas: Quotas = quotas || company.quotas || {
    seats: 10,
    telecallers: 10,
    supervisors: 2,
    concurrentAgents: 10,
    monthlyMinutes: 20000,
    storageGb: 20,
    records: 30000,
  };
  const left = company.endDate ? daysUntil(company.endDate) : 0;
  const plan = company.planId ? getPlan(company.planId) : undefined;
  const hasIvr = (company.features || []).some((f) => f.startsWith('ivr_') || f === 'call_recordings');
  const planTag = hasIvr ? 'IVR' : 'CRM';
  const codeDigits = company.code ? String(company.code).replace(/[^0-9]/g, '') : '1000';
  const activationKey = company.activationKey || generateActivationKey(company.name || 'Company', planTag, company.endDate || '2026-10-01');
  const adminPassword = company.adminPassword || `BNOrbit@${codeDigits}#2026`;
  const userLimit = activeQuotas.telecallers || activeQuotas.seats || 10;
  const monthlyBill = company.totalMonthlyBilling != null ? company.totalMonthlyBilling : (userLimit * (company.pricePerUser || 2000));
  const loginEmail = company.loginEmail || generateLoginEmail(company.contactName || 'admin', company.name || 'company', codeDigits);
  const isStopped = company.status === 'suspended' || company.activationKeyStatus === 'deactivated';

  const copyKey = () => {
    navigator.clipboard.writeText(activationKey);
    setCopiedKey(true);
    toast.success('Copied activation key to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyLoginEmail = () => {
    navigator.clipboard.writeText(loginEmail);
    setCopiedLoginEmail(true);
    toast.success('Copied login email to clipboard');
    setTimeout(() => setCopiedLoginEmail(false), 2000);
  };

  const usageRows = useMemo(() => {
    if (!company) return [];
    const u = company.usage || {
      seatsUsed: 0,
      supervisorsUsed: 0,
      telecallersUsed: 0,
      concurrentLive: 0,
      minutesUsed: 0,
      storageUsedGb: 0,
      recordsUsed: 0,
      callsThisMonth: 0,
    };
    return [
      ['Users / seats', u.seatsUsed ?? 0, activeQuotas.seats ?? 0, ''],
      ['Supervisors', u.supervisorsUsed ?? 0, activeQuotas.supervisors ?? 0, ''],
      ['Telecallers', u.telecallersUsed ?? 0, activeQuotas.telecallers ?? 0, ''],
      ['Concurrent live', u.concurrentLive ?? 0, activeQuotas.concurrentAgents ?? 0, ''],
      ['Minutes this month', u.minutesUsed ?? 0, activeQuotas.monthlyMinutes ?? 0, ''],
      ['Storage GB', u.storageUsedGb ?? 0, activeQuotas.storageGb ?? 0, ' GB'],
      ['Records', u.recordsUsed ?? 0, activeQuotas.records ?? 0, ''],
    ] as const;
  }, [company, activeQuotas]);

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => navigate('/superadmin/companies')}>
            <ChevronLeft size={14} /> Companies
          </button>
          <h1 className="page-title" style={{ marginTop: '0.75rem' }}>
            <Building2 size={24} /> {company.name}
          </h1>
          <p className="page-subtitle">{company.code} · {company.city} · {plan?.name}</p>
        </div>
        <StatusBadge status={company.status} />
      </div>

      {company.renewalRequested && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1.5px solid rgba(245, 158, 11, 0.45)',
            borderRadius: '8px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BellRing size={20} color="#f59e0b" />
            <div>
              <strong style={{ color: '#d97706', fontSize: '0.9rem' }}>Renewal Requested by Supervisor</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supervisor requested a license renewal on {company.renewalRequestedAt ? new Date(company.renewalRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'recently'}. Issue a new 16-digit activation key to extend validity.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowRenewModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
          >
            <RotateCw size={13} />
            <span>Renew Company & Issue Key</span>
          </button>
        </div>
      )}

      {(company.status === 'expired' || company.status === 'suspended') && (
        <div className="sa-lock-banner">
          Login locked for this tenant. Data is kept. Extend or reactivate to restore access.
        </div>
      )}
      {company.status === 'grace' && (
        <div className="sa-lock-banner grace">
          Grace window — Company Admin still logs in with a pay-now banner. Auto-lock after {company.graceDays} days.
        </div>
      )}

      <div className="sa-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`sa-tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Activation Key & Credentials Card */}
          <div
            className="card"
            style={{
              background: isStopped
                ? 'rgba(239, 68, 68, 0.05)'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: isStopped ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1.5px solid rgba(16, 185, 129, 0.35)',
              padding: '1.25rem 1.5rem',
            }}
          >
            {isStopped && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.85rem',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  marginBottom: '1rem',
                }}
              >
                <Ban size={16} /> ACTIVATION KEY DEACTIVATED — Tenant operation is stopped. Supervisor and telecaller access is locked.
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isStopped ? '#ef4444' : 'var(--accent-success)',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Key size={14} /> 16-Digit Activation Key {isStopped && '(DEACTIVATED)'}
                </span>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: isStopped ? '#ef4444' : 'var(--text-primary)',
                    textDecoration: isStopped ? 'line-through' : 'none',
                    letterSpacing: '0.08em',
                    marginTop: '0.25rem',
                  }}
                >
                  {activationKey}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={copyKey}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                >
                  {copiedKey ? <CheckCircle2 size={13} color="var(--accent-success)" /> : <Copy size={13} />}
                  <span>{copiedKey ? 'Key Copied!' : 'Copy Key'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCredsModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                >
                  <Send size={13} />
                  <span>Send Credentials & Key</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', fontSize: '0.8125rem', borderTop: '1px solid rgba(0, 0, 0, 0.06)', paddingTop: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Portal Login Email: </span>
                <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{loginEmail}</strong>
                <button
                  type="button"
                  onClick={copyLoginEmail}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6, color: 'var(--accent-primary)', verticalAlign: 'middle' }}
                  title="Copy login email"
                >
                  {copiedLoginEmail ? <CheckCircle2 size={12} color="var(--accent-success)" /> : <Copy size={12} />}
                </button>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Admin Password: </span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {showPassword ? adminPassword : '••••••••••••'}
                </strong>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 6, color: 'var(--text-muted)', verticalAlign: 'middle' }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Authorized Users: </span>
                <strong style={{ color: 'var(--accent-primary)' }}>{userLimit} Telecallers</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Monthly Billing: </span>
                <strong style={{ color: 'var(--accent-success)' }}>₹{(monthlyBill ?? 0).toLocaleString('en-IN')}</strong>
                <span style={{ color: 'var(--text-muted)' }}> (Internal)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contact Email: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{company.contactEmail}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Valid Till: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{company.endDate}</strong>
              </div>
            </div>
          </div>

          <div className="sa-split">
            <div className="card">
              <h3 className="card-title">Tenant Profile</h3>
              <div className="sa-review" style={{ marginTop: '1rem' }}>
                <p><span>Legal name</span><strong>{company.legalName}</strong></p>
                <p><span>GST</span><strong>{company.gst || '—'}</strong></p>
                <p><span>Company Admin</span><strong>{company.contactName}</strong></p>
                <p><span>Portal Login</span><strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{loginEmail}</strong></p>
                <p><span>Contact Email</span><strong>{company.contactEmail}</strong></p>
                <p><span>Phone</span><strong>{company.contactPhone}</strong></p>
                <p><span>Last login</span><strong>{formatWhen(company.lastLogin)}</strong></p>
              </div>
            </div>
            <div className="card">
              <h3 className="card-title">Quick actions</h3>
              <div className="sa-actions" style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowRenewModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <RotateCw size={14} /> Renew Subscription & Key
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 7); toast.success('Extended 7 days'); }}>+7 days</button>
                <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 15); toast.success('Extended 15 days'); }}>+15 days</button>
                <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 30); toast.success('Extended 30 days'); }}>+30 days</button>
                {!isStopped ? (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => setShowStopModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.35)', fontWeight: 600 }}
                  >
                    <PowerOff size={14} /> Stop & Deactivate Key
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      resumeCompany(company.id);
                      toast.success('Company resumed & activation key reactivated');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                  >
                    <Play size={14} /> Resume & Reactivate Key
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <Trash2 size={14} /> Delete Company
                </button>
              </div>
              <p className="sa-muted" style={{ marginTop: '1rem' }}>
                Super Admin controls tenant status. Seat limit is {userLimit}; Company Admin creates them using their activation key.
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === 'Modules' && (
        <div className="card">
          <FeatureChecklist value={features} onChange={setLocalFeatures} />
          <div className="sa-wizard-nav">
            <span className="sa-muted">Unchecking calling also turns off IVR and recordings.</span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFeatures(company.id, features);
                toast.success('Modules saved');
              }}
            >
              Save modules
            </button>
          </div>
        </div>
      )}

      {tab === 'Limits' && (
        <div className="card">
          <div className="sa-form-grid">
            {([
              ['seats', 'Total users'],
              ['supervisors', 'Supervisors'],
              ['telecallers', 'Telecallers'],
              ['concurrentAgents', 'Concurrent agents'],
              ['monthlyMinutes', 'Minutes / month'],
              ['storageGb', 'Storage GB'],
              ['records', 'Records cap'],
            ] as const).map(([key, label]) => (
              <label key={key} className="sa-field">
                <span>{label}</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={activeQuotas[key] ?? 0}
                  onChange={(e) => setLocalQuotas({ ...activeQuotas, [key]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
          <div className="sa-wizard-nav">
            <span />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setQuotas(company.id, activeQuotas);
                toast.success('Limits saved');
              }}
            >
              Save limits
            </button>
          </div>
        </div>
      )}

      {tab === 'Subscription' && (
        <div className="card">
          <div className="sa-review">
            <p><span>Plan</span><strong>{plan?.name}</strong></p>
            <p><span>Start</span><strong>{company.startDate}</strong></p>
            <p><span>End</span><strong>{company.endDate} ({left < 0 ? 'overdue' : `${left} days left`})</strong></p>
            <p><span>Grace</span><strong>{company.graceDays} days</strong></p>
            <p><span>Auto-lock</span><strong>ON</strong></p>
            <p><span>Status</span><strong>{company.status}</strong></p>
          </div>
        </div>
      )}

      {tab === 'Usage' && (
        <div className="card">
          <div className="sa-list">
            {usageRows.map(([label, used, max, suffix]) => (
              <QuotaBar key={label} label={label} used={used} max={max} suffix={suffix} />
            ))}
          </div>
          <p className="sa-muted" style={{ marginTop: '1rem' }}>
            Calls this month: {(company.usage?.callsThisMonth ?? 0).toLocaleString('en-IN')} — aggregate only, no borrower PII.
          </p>
        </div>
      )}

      {tab === 'Audit' && (
        <div className="card">
          <div className="sa-list">
            {audits.map((a) => (
              <div key={a.id} className="sa-row-link">
                <div>
                  <strong>{a.action}</strong>
                  <div className="sa-muted">{a.actor} · {a.detail}</div>
                </div>
                <span className="sa-muted">{formatWhen(a.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Overview' && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 className="card-title">Enabled modules</h3>
          <div className="sa-modules" style={{ marginTop: '0.75rem' }}>
            {(company.features || []).map((code) => (
              <span key={code} className="sa-mod">
                {FEATURE_CATALOG.find((f) => f.code === code)?.label ?? code}
              </span>
            ))}
          </div>
        </div>
      )}

      {showCredsModal && (
        <SendCredentialsModal company={company} onClose={() => setShowCredsModal(false)} />
      )}

      {/* Modal: Renew Company Subscription & Issue Key */}
      {showRenewModal && (
        <RenewCompanyModal
          company={company}
          onClose={() => setShowRenewModal(false)}
          onRenewSuccess={() => {
            setShowRenewModal(false);
            setShowCredsModal(true);
          }}
        />
      )}

      {/* Modal: Confirm Stop Company & Deactivate Key */}
      {showStopModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowStopModal(false)}>
          <div className="sa-modal-dialog animate-scale-up" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title-wrap">
                <div className="sa-modal-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <PowerOff size={20} />
                </div>
                <div>
                  <h3 className="sa-modal-title">Stop Company & Deactivate Key</h3>
                  <p className="sa-modal-subtitle">{company.name} ({company.code})</p>
                </div>
              </div>
              <button type="button" className="sa-modal-close-btn" onClick={() => setShowStopModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sa-modal-body">
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Stopping this company will immediately:
                  <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0 }}>
                    <li>Set company status to <strong>Suspended</strong></li>
                    <li><strong>Deactivate the 16-Digit Activation Key:</strong> <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>{activationKey}</code></li>
                    <li>Lock out all supervisor and telecaller logins</li>
                  </ul>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                You can restore access and reactivate the key anytime by clicking <strong>Resume & Reactivate Key</strong>.
              </p>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowStopModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  stopCompany(company.id);
                  setShowStopModal(false);
                  toast.warning(`Company ${company.name} stopped. Activation key deactivated.`);
                }}
                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 700 }}
              >
                <PowerOff size={15} /> Confirm Stop & Deactivate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Company */}
      {showDeleteModal && (
        <div className="sa-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="sa-modal-dialog animate-scale-up" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title-wrap">
                <div className="sa-modal-icon-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="sa-modal-title">Delete Company Permanently</h3>
                  <p className="sa-modal-subtitle">{company.name} ({company.code})</p>
                </div>
              </div>
              <button type="button" className="sa-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sa-modal-body">
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Warning: This action cannot be undone.</strong>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)' }}>
                    Deleting <strong>{company.name}</strong> will permanently remove all tenant settings, activation key, quotas, and login credentials from the platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  deleteCompany(company.id);
                  toast.success(`Company ${company.name} deleted`);
                  navigate('/superadmin/companies');
                }}
                style={{ fontWeight: 700 }}
              >
                <Trash2 size={15} /> Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
