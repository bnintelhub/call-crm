import { Link } from 'react-router-dom';
import {
  Building2, Users, CreditCard, AlertTriangle, Clock, LayoutDashboard, ChevronRight,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan } from '../data/catalog';
import { StatusBadge, daysUntil, formatWhen, quotaPct } from '../components/format';
import QuotaBar from '../components/QuotaBar';

export default function SuperAdminDashboard() {
  const companies = useSuperAdminStore((s) => s.companies);
  const audits = useSuperAdminStore((s) => s.audits);

  const counts = {
    total: companies.length,
    active: companies.filter((c) => c.status === 'active').length,
    trial: companies.filter((c) => c.status === 'trial').length,
    expired: companies.filter((c) => c.status === 'expired' || c.status === 'suspended').length,
    grace: companies.filter((c) => c.status === 'grace').length,
  };

  const seatsSold = companies.reduce((n, c) => n + c.quotas.seats, 0);
  const seatsUsed = companies.reduce((n, c) => n + c.usage.seatsUsed, 0);
  const expiring = companies
    .filter((c) => c.status === 'active' || c.status === 'trial' || c.status === 'grace')
    .map((c) => ({ ...c, left: daysUntil(c.endDate) }))
    .filter((c) => c.left <= 7)
    .sort((a, b) => a.left - b.left);

  const hotUsage = companies
    .map((c) => ({
      company: c,
      pct: Math.max(
        quotaPct(c.usage.seatsUsed, c.quotas.seats),
        quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes),
        quotaPct(c.usage.storageUsedGb, c.quotas.storageGb),
      ),
    }))
    .filter((x) => x.pct >= 80)
    .sort((a, b) => b.pct - a.pct);

  const kpis = [
    { label: 'Companies', value: String(counts.total), icon: <Building2 size={22} />, color: 'indigo', change: `${counts.active} active` },
    { label: 'Trials', value: String(counts.trial), icon: <Clock size={22} />, color: 'cyan', change: 'demo accounts' },
    { label: 'Grace / overdue', value: String(counts.grace), icon: <AlertTriangle size={22} />, color: 'amber', change: 'pay now window' },
    { label: 'Locked', value: String(counts.expired), icon: <CreditCard size={22} />, color: 'red', change: 'expired or suspended' },
    { label: 'Seats used', value: `${seatsUsed}/${seatsSold}`, icon: <Users size={22} />, color: 'green', change: 'across tenants' },
  ];

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><LayoutDashboard size={24} /> Platform home</h1>
          <p className="page-subtitle">Tenant health — not live calling floor. Supervisors own the floor.</p>
        </div>
        <Link to="/superadmin/companies/new" className="btn btn-primary">New company</Link>
      </div>

      <div className="sa-kpi-row">
        {kpis.map((kpi) => (
          <div className="stat-card" key={kpi.label}>
            <div className={`stat-icon ${kpi.color}`}>{kpi.icon}</div>
            <div className="stat-content">
              <h3>{kpi.value}</h3>
              <p>{kpi.label}</p>
              <span className="stat-change">{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sa-split" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">Expiring in 7 days</h3>
            <Link to="/superadmin/companies" className="sa-muted">All companies</Link>
          </div>
          <div className="sa-list">
            {expiring.length === 0 && <p className="sa-muted">No tenants expiring this week.</p>}
            {expiring.map((c) => (
              <Link key={c.id} to={`/superadmin/companies/${c.id}`} className={`sa-row-link ${c.left < 0 ? 'danger' : 'sa-alert'}`}>
                <div>
                  <strong>{c.name}</strong>
                  <div className="sa-muted">{c.code} · {getPlan(c.planId)?.name} · ends {c.endDate}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={c.status} />
                  <span className="sa-muted">{c.left < 0 ? `${Math.abs(c.left)}d overdue` : `${c.left}d left`}</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">Quota alerts (80%+)</h3>
            <Link to="/superadmin/usage" className="sa-muted">Usage</Link>
          </div>
          <div className="sa-list">
            {hotUsage.length === 0 && <p className="sa-muted">No tenants near limits.</p>}
            {hotUsage.map(({ company: c, pct }) => (
              <Link key={c.id} to={`/superadmin/companies/${c.id}`} className="sa-row-link sa-alert">
                <div>
                  <strong>{c.name}</strong>
                  <div className="sa-muted">{c.usage.seatsUsed}/{c.quotas.seats} seats · {c.usage.callsThisMonth.toLocaleString('en-IN')} calls</div>
                </div>
                <strong>{pct}%</strong>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="sa-split" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">Seat load by company</h3>
          </div>
          <div className="sa-list">
            {companies.slice(0, 6).map((c) => (
              <QuotaBar
                key={c.id}
                label={`${c.code} ${c.name}`}
                used={c.usage.seatsUsed}
                max={c.quotas.seats}
              />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">Recent platform actions</h3>
            <Link to="/superadmin/audit" className="sa-muted">Audit</Link>
          </div>
          <div className="sa-list">
            {audits.slice(0, 6).map((a) => (
              <div key={a.id} className="sa-row-link">
                <div>
                  <strong>{a.action}</strong>
                  <div className="sa-muted">{a.companyCode} · {a.detail}</div>
                </div>
                <span className="sa-muted">{formatWhen(a.at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
