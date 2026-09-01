import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  Shield,
  Sliders,
  Gauge,
  CreditCard,
  ScrollText,
  UserCheck,
  Mail,
  PlayCircle,
  PauseCircle,
  Clock,
  Calendar,
  Layers,
  Save,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Users,
  PhoneCall,
  Lock,
  Trash2,
} from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import QuotaBar from '../components/QuotaBar';
import SendCredentialsModal from '../components/SendCredentialsModal';
import AdjustQuotaModal from '../components/AdjustQuotaModal';
import { StatusBadge, daysUntil, formatInr, formatWhen } from '../components/format';
import { FEATURE_CATALOG, PLANS, getPlan } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { FeatureCode, Quotas } from '../types';

const TABS = [
  { id: 'Overview', label: 'Overview & Profile', icon: Building2 },
  { id: 'Modules', label: 'Enabled Modules', icon: Sliders },
  { id: 'Limits', label: 'Capacity Limits', icon: Gauge },
  { id: 'Subscription', label: 'Subscription & Validity', icon: CreditCard },
  { id: 'Usage', label: 'Resource Usage', icon: HardDrive },
  { id: 'Audit', label: 'Audit Trail', icon: ScrollText },
] as const;

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const company = useSuperAdminStore((s) => s.companies.find((c) => c.id === id));
  const audits = useSuperAdminStore((s) =>
    s.audits.filter((a) => a.companyCode === company?.code)
  );
  const setFeatures = useSuperAdminStore((s) => s.setFeatures);
  const setQuotas = useSuperAdminStore((s) => s.setQuotas);
  const setStatus = useSuperAdminStore((s) => s.setStatus);
  const extendDays = useSuperAdminStore((s) => s.extendDays);
  const impersonateCompany = useSuperAdminStore((s) => s.impersonateCompany);
  const updateCompany = useSuperAdminStore((s) => s.updateCompany);
  const deleteCompany = useSuperAdminStore((s) => s.deleteCompany);

  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('Overview');
  const [features, setLocalFeatures] = useState<FeatureCode[]>(company?.features ?? []);
  const [quotas, setLocalQuotas] = useState<Quotas | null>(company?.quotas ?? null);

  // Modals
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // Edit profile inline
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: company?.name || '',
    legalName: company?.legalName || '',
    city: company?.city || '',
    gst: company?.gst || '',
    contactName: company?.contactName || '',
    contactEmail: company?.contactEmail || '',
    contactPhone: company?.contactPhone || '',
  });

  useEffect(() => {
    if (!company) return;
    setLocalFeatures(company.features);
    setLocalQuotas(company.quotas);
    setProfileForm({
      name: company.name,
      legalName: company.legalName,
      city: company.city,
      gst: company.gst,
      contactName: company.contactName,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
    });
  }, [company?.id]);

  const left = company ? daysUntil(company.endDate) : 0;
  const plan = company ? getPlan(company.planId) : undefined;

  const usageRows = useMemo(() => {
    if (!company) return [];
    return [
      ['Total Licensed Seats', company.usage.seatsUsed, company.quotas.seats, ' seats'],
      ['Telecallers (Floor)', company.usage.telecallersUsed, company.quotas.telecallers, ' agents'],
      ['Supervisors & Leads', company.usage.supervisorsUsed, company.quotas.supervisors, ' leads'],
      ['Concurrent Live Calling', company.usage.concurrentLive, company.quotas.concurrentAgents, ' channels'],
      ['Call Minutes (This Month)', company.usage.minutesUsed, company.quotas.monthlyMinutes, ' min'],
      ['Audio & File Storage', company.usage.storageUsedGb, company.quotas.storageGb, ' GB'],
      ['Debtor & Loan Records', company.usage.recordsUsed, company.quotas.records, ' records'],
    ] as const;
  }, [company]);

  if (!company || !quotas) {
    return (
      <div className="sa-page">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Building2 size={40} className="sa-text-muted" style={{ margin: '0 auto 1rem' }} />
          <h3>Tenant Company Not Found</h3>
          <p className="sa-muted">The requested tenant ID does not exist in BNORBIT platform.</p>
          <Link to="/superadmin/companies" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Back to Companies List
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateCompany(company.id, profileForm);
    setIsEditingProfile(false);
    toast.success('Company profile updated');
  };

  const handleToggleSuspend = () => {
    if (company.status === 'suspended') {
      setStatus(company.id, 'active', 'Reactivated by Super Admin');
      toast.success('Tenant reactivated');
    } else {
      setStatus(company.id, 'suspended', 'Suspended by Super Admin');
      toast.warning('Tenant access suspended');
    }
  };

  const handleImpersonate = () => {
    impersonateCompany(company.id);
    toast.success(`Impersonating ${company.name} · Super Admin view set`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to completely remove ${company.name}? This will purge tenant configurations.`)) {
      deleteCompany(company.id);
      toast.info(`Tenant ${company.name} deleted`);
      navigate('/superadmin/companies');
    }
  };

  return (
    <div className="sa-page animate-fade-in">
      {/* Header with Navigation & Quick Actions */}
      <div className="page-header">
        <div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/superadmin/companies')}
            style={{ marginBottom: '0.5rem' }}
          >
            <ChevronLeft size={14} /> All Companies
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="sa-company-avatar large">{company.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>
                {company.name}
              </h1>
              <p className="page-subtitle" style={{ margin: '3px 0 0' }}>
                <span className="sa-code-badge">{company.code}</span> · {company.city} · Plan:{' '}
                <strong>{plan?.name ?? company.planId}</strong>
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatusBadge status={company.status} />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleImpersonate}
            title="Impersonate Company Admin"
          >
            <UserCheck size={14} /> Impersonate
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowCredsModal(true)}
            title="Send Login Credentials"
          >
            <Mail size={14} /> Send Credentials
          </button>

          {company.status !== 'suspended' ? (
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={handleToggleSuspend}>
              <PauseCircle size={14} /> Suspend
            </button>
          ) : (
            <button type="button" className="btn btn-success-outline btn-sm" onClick={handleToggleSuspend}>
              <PlayCircle size={14} /> Reactivate
            </button>
          )}
        </div>
      </div>

      {/* Lock Banner if Expired or Suspended */}
      {(company.status === 'expired' || company.status === 'suspended') && (
        <div className="sa-lock-banner animate-fade-in">
          <Lock size={18} />
          <div>
            <strong>Tenant Login Locked:</strong> Telecaller and supervisor access is currently blocked. Data remains preserved. Extend validity or reactivate to restore access.
          </div>
        </div>
      )}

      {/* Grace Banner if in Grace Period */}
      {company.status === 'grace' && (
        <div className="sa-lock-banner grace animate-fade-in">
          <AlertTriangle size={18} />
          <div>
            <strong>Grace Period Active:</strong> Subscription ended on {company.endDate}. Automatic tenant lock will trigger after {company.graceDays} days grace window.
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="sa-tabs-bar">
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              className={`sa-tab-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <TabIcon size={16} />
              <span>{t.label}</span>
              {t.id === 'Modules' && (
                <span className="sa-tab-badge">{features.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {tab === 'Overview' && (
        <div className="sa-split animate-fade-in">
          {/* Company Profile Details */}
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-title">
                <Building2 size={18} /> Company Profile & Legal
              </h3>
              {!isEditingProfile ? (
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-primary"
                    onClick={handleSaveProfile}
                  >
                    <Save size={12} /> Save
                  </button>
                </div>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="sa-review">
                <p>
                  <span>Company Brand Name</span>
                  <strong>{company.name}</strong>
                </p>
                <p>
                  <span>Legal Entity Name</span>
                  <strong>{company.legalName}</strong>
                </p>
                <p>
                  <span>City / Region</span>
                  <strong>{company.city}</strong>
                </p>
                <p>
                  <span>GSTIN / Tax ID</span>
                  <strong>{company.gst || 'Not Provided'}</strong>
                </p>
                <p>
                  <span>Primary Admin Contact</span>
                  <strong>{company.contactName}</strong>
                </p>
                <p>
                  <span>Admin Email</span>
                  <strong>{company.contactEmail}</strong>
                </p>
                <p>
                  <span>Phone Number</span>
                  <strong>{company.contactPhone || '—'}</strong>
                </p>
                <p>
                  <span>Last Administrator Login</span>
                  <strong>{formatWhen(company.lastLogin)}</strong>
                </p>
                <p>
                  <span>Tenant Provisioned On</span>
                  <strong>{formatWhen(company.createdAt)}</strong>
                </p>
              </div>
            ) : (
              <div className="sa-form-grid" style={{ marginTop: '0.75rem' }}>
                <label className="sa-field">
                  <span>Brand Name</span>
                  <input
                    className="form-input"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </label>
                <label className="sa-field">
                  <span>Legal Entity Name</span>
                  <input
                    className="form-input"
                    value={profileForm.legalName}
                    onChange={(e) => setProfileForm({ ...profileForm, legalName: e.target.value })}
                  />
                </label>
                <label className="sa-field">
                  <span>City</span>
                  <input
                    className="form-input"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  />
                </label>
                <label className="sa-field">
                  <span>GSTIN</span>
                  <input
                    className="form-input"
                    value={profileForm.gst}
                    onChange={(e) => setProfileForm({ ...profileForm, gst: e.target.value })}
                  />
                </label>
                <label className="sa-field">
                  <span>Admin Name</span>
                  <input
                    className="form-input"
                    value={profileForm.contactName}
                    onChange={(e) => setProfileForm({ ...profileForm, contactName: e.target.value })}
                  />
                </label>
                <label className="sa-field">
                  <span>Admin Email</span>
                  <input
                    type="email"
                    className="form-input"
                    value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Quick Subscription & Actions */}
          <div className="card">
            <div className="card-header-row">
              <h3 className="card-title">
                <CreditCard size={18} /> Validity & Quick Actions
              </h3>
            </div>

            <div className="sa-review" style={{ marginBottom: '1.25rem' }}>
              <p>
                <span>Active Plan</span>
                <strong>{plan?.name} ({company.billingCycle})</strong>
              </p>
              <p>
                <span>Valid Period</span>
                <strong>
                  {company.startDate} → {company.endDate}
                </strong>
              </p>
              <p>
                <span>Status Window</span>
                <strong className={left < 0 ? 'sa-text-danger' : left <= 7 ? 'sa-text-warning' : ''}>
                  {left < 0 ? `${Math.abs(left)} days overdue` : `${left} days remaining`}
                </strong>
              </p>
            </div>

            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Extend Subscription Validity
            </h4>
            <div className="sa-actions" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  extendDays(company.id, 7);
                  toast.success('Extended +7 days');
                }}
              >
                +7 Days
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  extendDays(company.id, 15);
                  toast.success('Extended +15 days');
                }}
              >
                +15 Days
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  extendDays(company.id, 30);
                  toast.success('Extended +30 days');
                }}
              >
                +30 Days (1 Mo)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  extendDays(company.id, 365);
                  toast.success('Extended +1 Year');
                }}
              >
                +1 Year
              </button>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-danger-outline btn-xs"
                onClick={handleDelete}
              >
                <Trash2 size={13} /> Delete Tenant
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setTab('Modules')}
              >
                Configure Modules →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Modules (Feature Checklist) */}
      {tab === 'Modules' && (
        <div className="card animate-fade-in">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <Sliders size={18} /> Tenant Module Access Control
              </h3>
              <p className="sa-muted">
                Toggle features on or off for this tenant. Unchecking dependent features will auto-resolve.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFeatures(company.id, features);
                toast.success('Modules updated for tenant');
              }}
            >
              <Save size={15} /> Save Module Changes
            </button>
          </div>

          <FeatureChecklist value={features} onChange={setLocalFeatures} />
        </div>
      )}

      {/* Tab 3: Limits & Quotas */}
      {tab === 'Limits' && (
        <div className="card animate-fade-in">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <Gauge size={18} /> Provisioned Capacity Boundaries
              </h3>
              <p className="sa-muted">
                Adjust resource boundaries for seats, telephony minutes, storage & records.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setQuotas(company.id, quotas);
                toast.success('Capacity limits saved');
              }}
            >
              <Save size={15} /> Save Limits
            </button>
          </div>

          <div className="sa-form-grid" style={{ marginTop: '1rem' }}>
            {([
              ['seats', 'Total Licensed Seats (Users)'],
              ['telecallers', 'Telecaller Floor Agents'],
              ['supervisors', 'Supervisors / Leads'],
              ['concurrentAgents', 'Concurrent Dialer Channels'],
              ['monthlyMinutes', 'Monthly Call Minutes Cap'],
              ['storageGb', 'Audio & Document Storage (GB)'],
              ['records', 'Debtor / Loan Records Cap'],
            ] as const).map(([key, label]) => (
              <label key={key} className={`sa-field ${key === 'records' ? 'full' : ''}`}>
                <span>{label}</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={quotas[key]}
                  onChange={(e) => setLocalQuotas({ ...quotas, [key]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Subscription */}
      {tab === 'Subscription' && (
        <div className="sa-split animate-fade-in">
          <div className="card">
            <h3 className="card-title">
              <CreditCard size={18} /> Subscription Information
            </h3>
            <div className="sa-review" style={{ marginTop: '1rem' }}>
              <p>
                <span>Selected Plan</span>
                <strong>{plan?.name}</strong>
              </p>
              <p>
                <span>Billing Frequency</span>
                <strong>{company.billingCycle.toUpperCase()}</strong>
              </p>
              <p>
                <span>Monthly Rate</span>
                <strong>{plan?.custom ? 'Custom' : formatInr(plan?.monthlyPrice ?? 0)}</strong>
              </p>
              <p>
                <span>Activation Date</span>
                <strong>{company.startDate}</strong>
              </p>
              <p>
                <span>Renewal / Expiry Date</span>
                <strong>{company.endDate}</strong>
              </p>
              <p>
                <span>Grace Window</span>
                <strong>{company.graceDays} Days</strong>
              </p>
              <p>
                <span>Auto-Lock on Expiry</span>
                <strong>{company.autoLockOnExpiry ? 'YES (Active)' : 'NO'}</strong>
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Change Plan Tier</h3>
            <p className="sa-muted" style={{ margin: '0.5rem 0 1rem' }}>
              Switching plan tier will update feature permissions and default limits.
            </p>
            <div className="sa-list">
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={`sa-row-item ${company.planId === p.id ? 'active-border' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    updateCompany(company.id, {
                      planId: p.id,
                      features: [...p.features],
                      quotas: { ...p.quotas },
                    });
                    setLocalFeatures([...p.features]);
                    setLocalQuotas({ ...p.quotas });
                    toast.success(`Switched to ${p.name}`);
                  }}
                >
                  <div>
                    <strong>{p.name}</strong>
                    <div className="sa-muted">{p.tagline}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>
                      {p.custom ? 'Custom' : `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo`}
                    </div>
                    {company.planId === p.id && (
                      <span className="badge badge-success">Current Plan</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Usage */}
      {tab === 'Usage' && (
        <div className="card animate-fade-in">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <HardDrive size={18} /> Tenant Resource Consumption
              </h3>
              <p className="sa-muted">
                Aggregated telemetry for {company.name}. No individual borrower or customer records shown.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowQuotaModal(true)}
            >
              Adjust Quotas
            </button>
          </div>

          <div className="sa-list" style={{ marginTop: '1rem' }}>
            {usageRows.map(([label, used, max, suffix]) => (
              <QuotaBar key={label} label={label} used={used} max={max} suffix={suffix} />
            ))}
          </div>

          <div className="sa-info-alert" style={{ marginTop: '1.5rem' }}>
            <Users size={16} />
            <span>
              Calls logged this billing cycle: <strong>{company.usage.callsThisMonth.toLocaleString('en-IN')}</strong> total connected sessions.
            </span>
          </div>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {tab === 'Audit' && (
        <div className="card animate-fade-in">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <ScrollText size={18} /> Governance & Security Audit History
          </h3>

          <div className="sa-list">
            {audits.length === 0 ? (
              <p className="sa-muted">No audit events recorded for this tenant yet.</p>
            ) : (
              audits.map((a) => (
                <div key={a.id} className="sa-activity-item">
                  <div className="sa-activity-dot" />
                  <div className="sa-activity-body">
                    <div className="sa-activity-title-row">
                      <strong>{a.action}</strong>
                      <span className="sa-muted">{formatWhen(a.at)}</span>
                    </div>
                    <p className="sa-activity-desc">
                      <strong>{a.actor}</strong>: {a.detail}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCredsModal && (
        <SendCredentialsModal
          company={company}
          onClose={() => setShowCredsModal(false)}
        />
      )}

      {showQuotaModal && (
        <AdjustQuotaModal
          company={company}
          onClose={() => setShowQuotaModal(false)}
        />
      )}
    </div>
  );
}
