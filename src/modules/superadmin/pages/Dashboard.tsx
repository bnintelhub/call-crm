import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  AlertTriangle,
  Clock,
  LayoutDashboard,
  ChevronRight,
  PhoneCall,
  Lock,
  Plus,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan } from '../data/catalog';
import { StatusBadge, daysUntil, formatWhen, quotaPct } from '../components/format';
import QuotaBar from '../components/QuotaBar';
import SendCredentialsModal from '../components/SendCredentialsModal';
import { toast } from '../../../components/shared/Toast';
import type { Company } from '../types';

export default function SuperAdminDashboard() {
  const companies = useSuperAdminStore((s) => s.companies);
  const audits = useSuperAdminStore((s) => s.audits);
  const extendDays = useSuperAdminStore((s) => s.extendDays);

  const [selectedCredsCompany, setSelectedCredsCompany] = useState<Company | null>(null);

  // Platform Level SaaS Metrics
  const totalCompanies = companies.length;
  const activeCount = companies.filter((c) => c.status === 'active').length;
  const trialCount = companies.filter((c) => c.status === 'trial').length;
  const graceCount = companies.filter((c) => c.status === 'grace').length;
  const expiredCount = companies.filter((c) => c.status === 'expired').length;
  const suspendedCount = companies.filter((c) => c.status === 'suspended').length;
  const lockedCount = expiredCount + suspendedCount;

  // Capacity & Utilization
  const seatsSold = companies.reduce((n, c) => n + c.quotas.seats, 0);
  const seatsUsed = companies.reduce((n, c) => n + c.usage.seatsUsed, 0);
  const totalMinutesUsed = companies.reduce((n, c) => n + c.usage.minutesUsed, 0);
  const totalCallsToday = Math.round(companies.reduce((n, c) => n + c.usage.callsThisMonth, 0) / 22);

  // Expiring in 7 days
  const expiringSoon = companies
    .filter((c) => c.status === 'active' || c.status === 'trial' || c.status === 'grace')
    .map((c) => ({ ...c, left: daysUntil(c.endDate) }))
    .filter((c) => c.left <= 7 && c.left >= -5)
    .sort((a, b) => a.left - b.left);

  // Quota alerts (80%+)
  const quotaAlerts = companies
    .map((c) => {
      const seatPct = quotaPct(c.usage.seatsUsed, c.quotas.seats);
      const minPct = quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes);
      const storagePct = quotaPct(c.usage.storageUsedGb, c.quotas.storageGb);
      const maxPct = Math.max(seatPct, minPct, storagePct);
      let hotResource = 'Seats';
      if (minPct === maxPct && minPct > 0) hotResource = 'Call Minutes';
      if (storagePct === maxPct && storagePct > 0) hotResource = 'Storage';

      return { company: c, maxPct, hotResource, seatPct, minPct, storagePct };
    })
    .filter((x) => x.maxPct >= 80)
    .sort((a, b) => b.maxPct - a.maxPct);

  // Metric Cards Data
  const topMetrics = [
    {
      title: 'Total Companies',
      value: totalCompanies,
      sub: `${activeCount} Active · ${trialCount} Trial`,
      icon: <Building2 size={20} />,
      color: 'indigo',
      badge: '+12% MoM',
      badgeTone: 'indigo',
    },
    {
      title: 'Active / Trial / Expired',
      value: `${activeCount} / ${trialCount} / ${expiredCount}`,
      sub: `${graceCount} in grace period`,
      icon: <Clock size={20} />,
      color: 'blue',
      badge: '94% Active',
      badgeTone: 'blue',
    },
    {
      title: 'Seats Used vs Total',
      value: `${seatsUsed} / ${seatsSold}`,
      sub: `${Math.round((seatsUsed / (seatsSold || 1)) * 100)}% platform seat load`,
      icon: <Users size={20} />,
      color: 'green',
      badge: `${seatsSold - seatsUsed} Avail`,
      badgeTone: 'green',
    },
    {
      title: 'Calls Today (Aggregate)',
      value: totalCallsToday.toLocaleString('en-IN'),
      sub: `${(totalMinutesUsed / 1000).toFixed(1)}k min consumed`,
      icon: <PhoneCall size={20} />,
      color: 'cyan',
      badge: 'Carrier Live',
      badgeTone: 'cyan',
    },
    {
      title: 'Expiring in 7 Days',
      value: expiringSoon.length,
      sub: 'Action required before lock',
      icon: <AlertTriangle size={20} />,
      color: expiringSoon.length > 0 ? 'amber' : 'green',
      badge: expiringSoon.length > 0 ? 'Urgent' : 'All Good',
      badgeTone: expiringSoon.length > 0 ? 'amber' : 'green',
    },
    {
      title: 'Locked Accounts',
      value: lockedCount,
      sub: `${expiredCount} Expired · ${suspendedCount} Suspended`,
      icon: <Lock size={20} />,
      color: lockedCount > 0 ? 'red' : 'gray',
      badge: 'Auto-Lock ON',
      badgeTone: lockedCount > 0 ? 'red' : 'gray',
    },
  ];

  return (
    <div className="sa-page animate-fade-in">
      {/* Top Banner / Welcome Row */}
      <div className="page-header sa-dashboard-header">
        <div>
          <div className="sa-badge-pill">
            <ShieldCheck size={14} /> BNORBIT SaaS Control Plane
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <LayoutDashboard size={24} /> Platform Overview
          </h1>
          <p className="page-subtitle">
            High-level SaaS health, company licensing, seat distribution & telephony telemetry.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/superadmin/companies/new" className="btn btn-primary">
            <Plus size={16} /> New Company
          </Link>
        </div>
      </div>

      {/* Top High-level Metric Cards (Grid of 6) */}
      <div className="sa-kpi-grid">
        {topMetrics.map((m) => (
          <div key={m.title} className="sa-metric-card">
            <div className="sa-metric-card-top">
              <div className={`sa-stat-icon-box ${m.color}`}>{m.icon}</div>
              <span className={`sa-stat-chip ${m.badgeTone}`}>{m.badge}</span>
            </div>
            <div className="sa-metric-card-body">
              <div className="sa-stat-value">{m.value}</div>
              <div className="sa-stat-label">{m.title}</div>
              <div className="sa-stat-sub">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Split Sections: Expiring Soon & Quota Alerts */}
      <div className="sa-split" style={{ marginTop: '1.25rem' }}>
        {/* Expiring in 7 Days */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <AlertTriangle size={18} className="sa-text-warning" /> Expiring Soon (Next 7 Days)
              </h3>
              <p className="sa-muted">Tenants that will transition into grace or locked state.</p>
            </div>
            <Link to="/superadmin/companies" className="btn btn-xs btn-secondary">
              View All
            </Link>
          </div>

          <div className="sa-list">
            {expiringSoon.length === 0 ? (
              <div className="sa-empty-inline">
                <ShieldCheck size={28} className="sa-text-success" />
                <p>No tenant subscriptions are expiring in the next 7 days.</p>
              </div>
            ) : (
              expiringSoon.map((c) => (
                <div key={c.id} className={`sa-row-item ${c.left < 0 ? 'overdue' : 'warning-border'}`}>
                  <div className="sa-row-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                        {c.name}
                      </Link>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="sa-muted" style={{ marginTop: '2px' }}>
                      {c.code} · Plan: <strong>{getPlan(c.planId)?.name}</strong> · Contact:{' '}
                      {c.contactEmail}
                    </div>
                  </div>

                  <div className="sa-row-right">
                    <span
                      className={`sa-days-pill ${
                        c.left < 0 ? 'overdue' : c.left <= 2 ? 'urgent' : 'ok'
                      }`}
                    >
                      {c.left < 0
                        ? `${Math.abs(c.left)}d overdue`
                        : c.left === 0
                        ? 'Expires Today'
                        : `${c.left}d left`}
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-secondary"
                      onClick={() => {
                        extendDays(c.id, 15);
                        toast.success(`Extended ${c.name} for 15 days`);
                      }}
                      title="Extend +15 days validity"
                    >
                      +15 Days
                    </button>
                    <Link to={`/superadmin/companies/${c.id}`} className="btn btn-xs btn-outline">
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quota Alerts (80%+) */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <Zap size={18} className="sa-text-warning" /> Quota Alerts (80%+ Consumed)
              </h3>
              <p className="sa-muted">Tenants near license caps or telephony limits.</p>
            </div>
            <Link to="/superadmin/usage" className="btn btn-xs btn-secondary">
              Usage Center
            </Link>
          </div>

          <div className="sa-list">
            {quotaAlerts.length === 0 ? (
              <div className="sa-empty-inline">
                <ShieldCheck size={28} className="sa-text-success" />
                <p>All tenants are operating comfortably within their provisioned quotas (&lt;80%).</p>
              </div>
            ) : (
              quotaAlerts.map(({ company: c, maxPct, hotResource }) => (
                <div key={c.id} className="sa-row-item warning-border">
                  <div className="sa-row-info" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                        {c.name}
                      </Link>
                      <span className={`sa-quota-badge ${maxPct >= 95 ? 'danger' : 'warning'}`}>
                        {maxPct}% {hotResource}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <QuotaBar
                        compact
                        used={
                          hotResource === 'Call Minutes'
                            ? c.usage.minutesUsed
                            : c.usage.seatsUsed
                        }
                        max={
                          hotResource === 'Call Minutes'
                            ? c.quotas.monthlyMinutes
                            : c.quotas.seats
                        }
                        suffix={hotResource === 'Call Minutes' ? ' min' : ' seats'}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Telemetry & Platform Activities Split */}
      <div className="sa-split" style={{ marginTop: '1.25rem' }}>
        {/* Seat & Resource Distribution */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <Users size={18} /> Tenant Seat Allocation Load
              </h3>
              <p className="sa-muted">Active seat consumption across top tenants</p>
            </div>
            <Link to="/superadmin/usage" className="sa-muted">
              View All
            </Link>
          </div>

          <div className="sa-list">
            {companies.slice(0, 5).map((c) => (
              <div key={c.id} className="sa-seat-load-row">
                <div className="sa-seat-load-info">
                  <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                    {c.name}
                  </Link>
                  <span className="sa-muted">{c.code} · {getPlan(c.planId)?.name}</span>
                </div>
                <div style={{ flex: 1, maxWidth: '240px' }}>
                  <QuotaBar
                    compact
                    used={c.usage.seatsUsed}
                    max={c.quotas.seats}
                    suffix=" seats"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Platform Governance Audits */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <h3 className="card-title">
                <ShieldCheck size={18} /> Recent Platform Actions
              </h3>
              <p className="sa-muted">Tenant lifecycle events & security audit stream</p>
            </div>
            <Link to="/superadmin/audit" className="sa-muted">
              Full Audit Log
            </Link>
          </div>

          <div className="sa-list">
            {audits.slice(0, 5).map((a) => (
              <div key={a.id} className="sa-activity-item">
                <div className="sa-activity-dot" />
                <div className="sa-activity-body">
                  <div className="sa-activity-title-row">
                    <strong>{a.action}</strong>
                    <span className="sa-muted">{formatWhen(a.at)}</span>
                  </div>
                  <p className="sa-activity-desc">
                    <span className="sa-code-badge">{a.companyCode}</span> {a.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Impersonate & Send Credentials Modal */}
      {selectedCredsCompany && (
        <SendCredentialsModal
          company={selectedCredsCompany}
          onClose={() => setSelectedCredsCompany(null)}
        />
      )}
    </div>
  );
}
