import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gauge,
  Users,
  PhoneCall,
  HardDrive,
  Database,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Sliders,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import QuotaBar from '../components/QuotaBar';
import { StatusBadge, quotaPct } from '../components/format';
import AdjustQuotaModal from '../components/AdjustQuotaModal';
import EmptyState from '../components/EmptyState';
import { useSuperAdminStore } from '../store';
import type { Company } from '../types';

export default function UsagePage() {
  const companies = useSuperAdminStore((s) => s.companies);

  const [q, setQ] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'high' | 'critical'>('all');
  const [selectedQuotaCompany, setSelectedQuotaCompany] = useState<Company | null>(null);

  // Platform Aggregate Metrics
  const totalSeatsSold = companies.reduce((n, c) => n + c.quotas.seats, 0);
  const totalSeatsUsed = companies.reduce((n, c) => n + c.usage.seatsUsed, 0);

  const totalMinSold = companies.reduce((n, c) => n + c.quotas.monthlyMinutes, 0);
  const totalMinUsed = companies.reduce((n, c) => n + c.usage.minutesUsed, 0);

  const totalStorageSold = companies.reduce((n, c) => n + c.quotas.storageGb, 0);
  const totalStorageUsed = companies.reduce((n, c) => n + c.usage.storageUsedGb, 0);

  const totalRecordsSold = companies.reduce((n, c) => n + c.quotas.records, 0);
  const totalRecordsUsed = companies.reduce((n, c) => n + c.usage.recordsUsed, 0);

  // Filtered Companies
  const tenantRows = useMemo(() => {
    return companies
      .map((c) => {
        const seatPct = quotaPct(c.usage.seatsUsed, c.quotas.seats);
        const minPct = quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes);
        const storagePct = quotaPct(c.usage.storageUsedGb, c.quotas.storageGb);
        const recordsPct = quotaPct(c.usage.recordsUsed, c.quotas.records);
        const maxPct = Math.max(seatPct, minPct, storagePct, recordsPct);

        return {
          company: c,
          seatPct,
          minPct,
          storagePct,
          recordsPct,
          maxPct,
        };
      })
      .filter(({ company: c, maxPct }) => {
        const matchSearch =
          !q.trim() ||
          `${c.name} ${c.code} ${c.city}`.toLowerCase().includes(q.toLowerCase());

        if (!matchSearch) return false;
        if (filterMode === 'high') return maxPct >= 80;
        if (filterMode === 'critical') return maxPct >= 95;
        return true;
      })
      .sort((a, b) => b.maxPct - a.maxPct);
  }, [companies, q, filterMode]);

  const highUsageCount = companies.filter((c) => {
    const s = quotaPct(c.usage.seatsUsed, c.quotas.seats);
    const m = quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes);
    const st = quotaPct(c.usage.storageUsedGb, c.quotas.storageGb);
    return s >= 80 || m >= 80 || st >= 80;
  }).length;

  const criticalUsageCount = companies.filter((c) => {
    const s = quotaPct(c.usage.seatsUsed, c.quotas.seats);
    const m = quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes);
    const st = quotaPct(c.usage.storageUsedGb, c.quotas.storageGb);
    return s >= 95 || m >= 95 || st >= 95;
  }).length;

  return (
    <div className="sa-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <Gauge size={14} /> Telemetry & Capacity Governance
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <Gauge size={24} /> Resource Usage & Quota Governance
          </h1>
          <p className="page-subtitle">
            Monitor licensed capacities vs aggregate consumption. Tenants exceeding 80% usage are highlighted in orange/red.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="sa-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {/* Seats */}
        <div className="stat-card sa-stat-meter-card">
          <div className="sa-stat-meter-header">
            <div className="stat-icon green">
              <Users size={20} />
            </div>
            <span className="sa-badge-load green">
              {quotaPct(totalSeatsUsed, totalSeatsSold)}% Loaded
            </span>
          </div>
          <div className="sa-stat-meter-body">
            <h3 className="sa-stat-meter-val">
              {totalSeatsUsed} <span className="sa-stat-meter-max">/ {totalSeatsSold}</span>
            </h3>
            <p className="sa-stat-meter-label">Platform User Seats</p>
            <div className="sa-stat-meter-bar-wrap">
              <QuotaBar compact used={totalSeatsUsed} max={totalSeatsSold} suffix=" seats" />
            </div>
          </div>
        </div>

        {/* Minutes */}
        <div className="stat-card sa-stat-meter-card">
          <div className="sa-stat-meter-header">
            <div className="stat-icon indigo">
              <PhoneCall size={20} />
            </div>
            <span className="sa-badge-load indigo">
              {quotaPct(totalMinUsed, totalMinSold)}% Used
            </span>
          </div>
          <div className="sa-stat-meter-body">
            <h3 className="sa-stat-meter-val">
              {(totalMinUsed / 1000).toFixed(0)}k <span className="sa-stat-meter-max">/ {(totalMinSold / 1000).toFixed(0)}k</span>
            </h3>
            <p className="sa-stat-meter-label">Monthly Call Minutes</p>
            <div className="sa-stat-meter-bar-wrap">
              <QuotaBar compact used={totalMinUsed} max={totalMinSold} suffix=" min" />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="stat-card sa-stat-meter-card">
          <div className="sa-stat-meter-header">
            <div className="stat-icon cyan">
              <HardDrive size={20} />
            </div>
            <span className="sa-badge-load cyan">
              {quotaPct(totalStorageUsed, totalStorageSold)}% Used
            </span>
          </div>
          <div className="sa-stat-meter-body">
            <h3 className="sa-stat-meter-val">
              {totalStorageUsed.toFixed(1)} <span className="sa-stat-meter-max">/ {totalStorageSold} GB</span>
            </h3>
            <p className="sa-stat-meter-label">Audio & File Storage</p>
            <div className="sa-stat-meter-bar-wrap">
              <QuotaBar compact used={totalStorageUsed} max={totalStorageSold} suffix=" GB" />
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="stat-card sa-stat-meter-card">
          <div className="sa-stat-meter-header">
            <div className="stat-icon amber">
              <Database size={20} />
            </div>
            <span className="sa-badge-load amber">
              {quotaPct(totalRecordsUsed, totalRecordsSold)}% Capacity
            </span>
          </div>
          <div className="sa-stat-meter-body">
            <h3 className="sa-stat-meter-val">
              {(totalRecordsUsed / 1000).toFixed(0)}k <span className="sa-stat-meter-max">/ {(totalRecordsSold / 1000).toFixed(0)}k</span>
            </h3>
            <p className="sa-stat-meter-label">Debtor / Loan Records</p>
            <div className="sa-stat-meter-bar-wrap">
              <QuotaBar compact used={totalRecordsUsed} max={totalRecordsSold} suffix=" records" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card sa-toolbar-card" style={{ marginTop: '1.25rem' }}>
        <div className="sa-toolbar-row">
          <div className="form-input-icon sa-search-input-field" style={{ flex: 1, minWidth: '280px' }}>
            <Search className="icon" size={16} />
            <input
              className="form-input"
              placeholder="Search tenant name, code, city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="sa-filters">
            <button
              type="button"
              className={`sa-chip ${filterMode === 'all' ? 'on' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All Tenants <span className="sa-chip-count">{companies.length}</span>
            </button>
            <button
              type="button"
              className={`sa-chip warning ${filterMode === 'high' ? 'on' : ''}`}
              onClick={() => setFilterMode('high')}
            >
              <Zap size={13} /> High Usage (80%+) <span className="sa-chip-count warning">{highUsageCount}</span>
            </button>
            <button
              type="button"
              className={`sa-chip danger ${filterMode === 'critical' ? 'on' : ''}`}
              onClick={() => setFilterMode('critical')}
            >
              <AlertTriangle size={13} /> Critical (95%+) <span className="sa-chip-count danger">{criticalUsageCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Per-Tenant Usage Cards */}
      {tenantRows.length === 0 ? (
        <EmptyState
          title="No Resource Overages Found"
          description="None of your active tenants currently match this usage filter threshold."
          actionText="Show All Tenants"
          onAction={() => {
            setFilterMode('all');
            setQ('');
          }}
          icon="search"
        />
      ) : (
        <div className="sa-usage-list" style={{ marginTop: '1rem' }}>
          {tenantRows.map(({ company: c, maxPct }) => {
            const isWarning = maxPct >= 80 && maxPct < 95;
            const isCritical = maxPct >= 95;

            return (
              <div
                key={c.id}
                className={`card sa-tenant-usage-card ${
                  isCritical ? 'critical-border' : isWarning ? 'warning-border' : ''
                }`}
              >
                {/* Header Row */}
                <div className="sa-tenant-usage-header">
                  <div className="sa-tenant-usage-meta">
                    <div className="sa-company-avatar">{c.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="sa-tenant-name-row">
                        <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                          {c.name}
                        </Link>
                        <StatusBadge status={c.status} />
                        {isCritical && (
                          <span className="sa-overage-badge danger">
                            <AlertTriangle size={12} /> 95%+ Over Quota
                          </span>
                        )}
                        {isWarning && (
                          <span className="sa-overage-badge warning">
                            <Zap size={12} /> 80%+ High Load
                          </span>
                        )}
                      </div>
                      <div className="sa-muted" style={{ marginTop: '3px' }}>
                        <span className="sa-code-badge">{c.code}</span> · {c.city} ·{' '}
                        <strong>{c.usage.callsThisMonth.toLocaleString('en-IN')}</strong> calls this month
                      </div>
                    </div>
                  </div>

                  <div className="sa-tenant-usage-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedQuotaCompany(c)}
                    >
                      <Sliders size={14} /> Adjust Limits
                    </button>
                    <Link to={`/superadmin/companies/${c.id}`} className="btn btn-outline btn-sm">
                      Details <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* 4 Quota Bars in 2x2 Grid */}
                <div className="sa-tenant-quota-grid">
                  <div className="sa-quota-item-card">
                    <QuotaBar
                      label="User Seats"
                      used={c.usage.seatsUsed}
                      max={c.quotas.seats}
                      suffix=" seats"
                    />
                  </div>
                  <div className="sa-quota-item-card">
                    <QuotaBar
                      label="Telecallers"
                      used={c.usage.telecallersUsed}
                      max={c.quotas.telecallers}
                      suffix=" telecallers"
                    />
                  </div>
                  <div className="sa-quota-item-card">
                    <QuotaBar
                      label="Monthly Minutes"
                      used={c.usage.minutesUsed}
                      max={c.quotas.monthlyMinutes}
                      suffix=" min"
                    />
                  </div>
                  <div className="sa-quota-item-card">
                    <QuotaBar
                      label="Storage Allocation"
                      used={c.usage.storageUsedGb}
                      max={c.quotas.storageGb}
                      suffix=" GB"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Quota Modal */}
      {selectedQuotaCompany && (
        <AdjustQuotaModal
          company={selectedQuotaCompany}
          onClose={() => setSelectedQuotaCompany(null)}
        />
      )}
    </div>
  );
}
