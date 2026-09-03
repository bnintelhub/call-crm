import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, ChevronLeft } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import QuotaBar from '../components/QuotaBar';
import { StatusBadge, daysUntil, formatWhen } from '../components/format';
import { FEATURE_CATALOG, getPlan } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { FeatureCode, Quotas } from '../types';

const TABS = ['Overview', 'Modules', 'Limits', 'Subscription', 'Usage', 'Audit'] as const;

export default function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const company = useSuperAdminStore((s) => s.companies.find((c) => c.id === id));
  const audits = useSuperAdminStore((s) => s.audits.filter((a) => a.companyCode === company?.code));
  const setFeatures = useSuperAdminStore((s) => s.setFeatures);
  const setQuotas = useSuperAdminStore((s) => s.setQuotas);
  const setStatus = useSuperAdminStore((s) => s.setStatus);
  const extendDays = useSuperAdminStore((s) => s.extendDays);

  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [features, setLocalFeatures] = useState<FeatureCode[]>(company?.features ?? []);
  const [quotas, setLocalQuotas] = useState<Quotas | null>(company?.quotas ?? null);

  useEffect(() => {
    if (!company) return;
    setLocalFeatures(company.features);
    setLocalQuotas(company.quotas);
    setTab('Overview');
  }, [company?.id]);

  const left = company ? daysUntil(company.endDate) : 0;
  const plan = company ? getPlan(company.planId) : undefined;

  const usageRows = useMemo(() => {
    if (!company) return [];
    return [
      ['Users / seats', company.usage.seatsUsed, company.quotas.seats, ''],
      ['Supervisors', company.usage.supervisorsUsed, company.quotas.supervisors, ''],
      ['Telecallers', company.usage.telecallersUsed, company.quotas.telecallers, ''],
      ['Concurrent live', company.usage.concurrentLive, company.quotas.concurrentAgents, ''],
      ['Minutes this month', company.usage.minutesUsed, company.quotas.monthlyMinutes, ''],
      ['Storage GB', company.usage.storageUsedGb, company.quotas.storageGb, ' GB'],
      ['Records', company.usage.recordsUsed, company.quotas.records, ''],
    ] as const;
  }, [company]);

  if (!company || !quotas) {
    return (
      <div className="sa-page">
        <p>Company not found.</p>
        <Link to="/superadmin/companies">Back to list</Link>
      </div>
    );
  }

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
        <div className="sa-split">
          <div className="card">
            <h3 className="card-title">Tenant</h3>
            <div className="sa-review" style={{ marginTop: '1rem' }}>
              <p><span>Legal name</span><strong>{company.legalName}</strong></p>
              <p><span>GST</span><strong>{company.gst || '—'}</strong></p>
              <p><span>Company Admin</span><strong>{company.contactName}</strong></p>
              <p><span>Email</span><strong>{company.contactEmail}</strong></p>
              <p><span>Phone</span><strong>{company.contactPhone}</strong></p>
              <p><span>Last login</span><strong>{formatWhen(company.lastLogin)}</strong></p>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title">Quick actions</h3>
            <div className="sa-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 7); toast.success('Extended 7 days'); }}>+7 days</button>
              <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 15); toast.success('Extended 15 days'); }}>+15 days</button>
              <button type="button" className="btn btn-secondary" onClick={() => { extendDays(company.id, 30); toast.success('Extended 30 days'); }}>+30 days</button>
              {company.status !== 'suspended' ? (
                <button type="button" className="btn btn-danger" onClick={() => { setStatus(company.id, 'suspended', 'Manual suspend from company page'); toast.warning('Tenant suspended'); }}>
                  Suspend
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => { setStatus(company.id, 'active', 'Manual reactivate'); toast.success('Tenant reactivated'); }}>
                  Reactivate
                </button>
              )}
            </div>
            <p className="sa-muted" style={{ marginTop: '1rem' }}>
              Super Admin does not create telecallers. Seat limit is {company.quotas.seats}; Company Admin fills them.
            </p>
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
                  value={quotas[key]}
                  onChange={(e) => setLocalQuotas({ ...quotas, [key]: Number(e.target.value) })}
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
                setQuotas(company.id, quotas);
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
            Calls this month: {company.usage.callsThisMonth.toLocaleString('en-IN')} — aggregate only, no borrower PII.
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
            {company.features.map((code) => (
              <span key={code} className="sa-mod">
                {FEATURE_CATALOG.find((f) => f.code === code)?.label ?? code}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
