import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Plus,
  Sparkles,
  Users,
  HardDrive,
  PhoneCall,
  Clock,
  Building2,
  Sliders,
} from 'lucide-react';
import { FEATURE_CATALOG, PLANS } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import { formatInr } from '../components/format';

export default function PlansPage() {
  const companies = useSuperAdminStore((s) => s.companies);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <Layers size={14} /> Subscription Catalog
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <Layers size={24} /> Plans & Packaging
          </h1>
          <p className="page-subtitle">
            Predefined licensing tiers, quota presets, and module bundles assigned to tenants.
          </p>
        </div>

        {/* Monthly / Annual Switcher */}
        <div className="sa-billing-switch">
          <button
            type="button"
            className={`sa-billing-switch-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`sa-billing-switch-btn ${billingCycle === 'annual' ? 'active' : ''}`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual Billing <span className="sa-discount-tag">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Plans Pricing Grid */}
      <div className="sa-plan-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {PLANS.map((p) => {
          const tenantCount = companies.filter((c) => c.planId === p.id).length;
          const displayPrice =
            billingCycle === 'monthly'
              ? p.monthlyPrice
              : Math.round((p.annualPrice ?? p.monthlyPrice * 10) / 12);

          return (
            <div key={p.id} className={`sa-pricing-card ${p.isPopular ? 'popular' : ''}`}>
              {p.isPopular && <div className="sa-popular-ribbon">Most Popular</div>}

              <div className="sa-pricing-header">
                <h3 className="sa-pricing-title">{p.name}</h3>
                <p className="sa-pricing-tagline">{p.tagline}</p>
                <div className="sa-pricing-price-wrap">
                  {p.custom ? (
                    <span className="sa-pricing-custom">Custom Scale</span>
                  ) : (
                    <>
                      <span className="sa-pricing-amount">₹{displayPrice.toLocaleString('en-IN')}</span>
                      <span className="sa-pricing-period">/ month</span>
                    </>
                  )}
                </div>
                {billingCycle === 'annual' && !p.custom && (
                  <span className="sa-pricing-billed-annual">
                    Billed annually (₹{p.annualPrice?.toLocaleString('en-IN')})
                  </span>
                )}
              </div>

              <div className="sa-pricing-meta-strip">
                <span className="sa-pricing-tenant-badge">
                  <Building2 size={13} /> {tenantCount} Tenants Enrolled
                </span>
              </div>

              {/* Resource Quota Highlights */}
              <div className="sa-pricing-quotas">
                <div className="sa-pricing-quota-row">
                  <Users size={15} />
                  <span>
                    <strong>{p.quotas.seats} Total Seats</strong> ({p.quotas.telecallers} Telecallers)
                  </span>
                </div>
                <div className="sa-pricing-quota-row">
                  <PhoneCall size={15} />
                  <span>
                    <strong>{p.quotas.monthlyMinutes.toLocaleString('en-IN')}</strong> Call Minutes / mo
                  </span>
                </div>
                <div className="sa-pricing-quota-row">
                  <HardDrive size={15} />
                  <span>
                    <strong>{p.quotas.storageGb} GB</strong> Storage Allocation
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="sa-pricing-features">
                <span className="sa-pricing-features-title">Included Modules:</span>
                {FEATURE_CATALOG.map((f) => {
                  const isIncluded = p.features.includes(f.code);
                  return (
                    <div
                      key={f.code}
                      className={`sa-pricing-feature-item ${isIncluded ? 'included' : 'excluded'}`}
                    >
                      {isIncluded ? (
                        <CheckCircle2 size={14} className="sa-text-success" />
                      ) : (
                        <XCircle size={14} className="sa-text-muted" />
                      )}
                      <span>{f.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="sa-pricing-footer">
                <Link
                  to={`/superadmin/companies/new`}
                  className={`btn btn-block ${p.isPopular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Create Tenant on {p.name}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Feature Comparison Matrix */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          <Sliders size={18} /> Detailed Plan Capability Comparison
        </h3>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Feature / Boundary</th>
                {PLANS.map((p) => (
                  <th key={p.id} style={{ textAlign: 'center' }}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Monthly Fee (INR)</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center', fontWeight: 700 }}>
                    {p.custom ? 'Custom' : `₹${p.monthlyPrice.toLocaleString('en-IN')}`}
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Included User Seats</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.quotas.seats} Seats
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Telecaller Floor Quota</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.quotas.telecallers} Agents
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Concurrent Live Channels</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.quotas.concurrentAgents} Channels
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Monthly Voice Minutes</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.quotas.monthlyMinutes.toLocaleString('en-IN')} mins
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Encrypted Storage</strong></td>
                {PLANS.map((p) => (
                  <td key={p.id} style={{ textAlign: 'center' }}>
                    {p.quotas.storageGb} GB
                  </td>
                ))}
              </tr>
              {FEATURE_CATALOG.map((f) => (
                <tr key={f.code}>
                  <td>
                    <strong>{f.label}</strong>
                    <div className="sa-muted">{f.hint}</div>
                  </td>
                  {PLANS.map((p) => (
                    <td key={p.id} style={{ textAlign: 'center' }}>
                      {p.features.includes(f.code) ? (
                        <CheckCircle2 size={18} className="sa-text-success" style={{ margin: '0 auto' }} />
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
