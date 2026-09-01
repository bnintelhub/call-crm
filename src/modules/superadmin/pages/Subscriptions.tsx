import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
  Send,
  Plus,
  Search,
  Building2,
  Filter,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan, PLANS } from '../data/catalog';
import { StatusBadge, daysUntil, formatInr, formatWhen } from '../components/format';
import { toast } from '../../../components/shared/Toast';
import type { Company, OrgStatus } from '../types';

export default function SubscriptionsPage() {
  const companies = useSuperAdminStore((s) => s.companies);
  const extendDays = useSuperAdminStore((s) => s.extendDays);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Compute Revenue & Subscription Health
  const payingCompanies = companies.filter(
    (c) => c.status === 'active' || c.status === 'grace'
  );

  const mrr = payingCompanies.reduce((total, c) => {
    const plan = getPlan(c.planId);
    if (!plan || plan.custom) return total + 50000;
    return total + (c.billingCycle === 'annual' ? Math.round((plan.annualPrice ?? plan.monthlyPrice * 10) / 12) : plan.monthlyPrice);
  }, 0);

  const arr = mrr * 12;
  const trialCount = companies.filter((c) => c.status === 'trial').length;
  const graceCount = companies.filter((c) => c.status === 'grace').length;
  const expiringNext7Days = companies.filter((c) => {
    const d = daysUntil(c.endDate);
    return d <= 7 && d >= 0 && (c.status === 'active' || c.status === 'trial');
  }).length;

  const filteredSubscriptions = useMemo(() => {
    return companies.filter((c) => {
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'expiring7'
          ? daysUntil(c.endDate) <= 7 && daysUntil(c.endDate) >= 0
          : c.status === statusFilter;

      const haystack = `${c.name} ${c.code} ${c.contactEmail} ${c.city}`.toLowerCase();
      const matchQ = !q.trim() || haystack.includes(q.toLowerCase());

      return matchStatus && matchQ;
    });
  }, [companies, q, statusFilter]);

  const handleSendInvoice = (company: Company) => {
    toast.success(`Tax invoice & payment link dispatched to ${company.contactEmail}`);
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <CreditCard size={14} /> Revenue & Subscriptions
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <CreditCard size={24} /> Tenant Subscriptions & Billing
          </h1>
          <p className="page-subtitle">
            Track Recurring Revenue (MRR/ARR), subscription lifecycle, renewal schedules & grace periods.
          </p>
        </div>

        <Link to="/superadmin/companies/new" className="btn btn-primary">
          <Plus size={16} /> New Subscription
        </Link>
      </div>

      {/* Revenue KPI Summary */}
      <div className="sa-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box green">
              <TrendingUp size={20} />
            </div>
            <span className="sa-stat-chip green">+18.4% YoY</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">{formatInr(mrr)}</div>
            <div className="sa-stat-label">Platform MRR</div>
            <div className="sa-stat-sub">{payingCompanies.length} Active Paying Tenants</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box indigo">
              <DollarSign size={20} />
            </div>
            <span className="sa-stat-chip indigo">Run Rate</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">{formatInr(arr)}</div>
            <div className="sa-stat-label">Projected ARR</div>
            <div className="sa-stat-sub">Annualized Revenue Potential</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box amber">
              <AlertTriangle size={20} />
            </div>
            <span className="sa-stat-chip amber">7 Days</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">{expiringNext7Days}</div>
            <div className="sa-stat-label">Expiring in 7 Days</div>
            <div className="sa-stat-sub">Renewal alerts pending</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box cyan">
              <Clock size={20} />
            </div>
            <span className="sa-stat-chip cyan">Pipeline</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">{trialCount}</div>
            <div className="sa-stat-label">Active Trials</div>
            <div className="sa-stat-sub">Potential pipeline conversions</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card sa-toolbar-card" style={{ marginTop: '1.25rem' }}>
        <div className="sa-toolbar-row">
          <div className="sa-search-input-field">
            <Search className="icon" size={15} />
            <input
              type="text"
              placeholder="Search company code, name, billing email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="sa-filters">
          {[
            { id: 'all', label: 'All Subscriptions' },
            { id: 'active', label: 'Active' },
            { id: 'trial', label: 'Trial' },
            { id: 'expiring7', label: 'Expiring in 7d' },
            { id: 'grace', label: 'Grace Period' },
            { id: 'expired', label: 'Expired' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              className={`sa-chip ${statusFilter === f.id ? 'on' : ''}`}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="table-wrapper" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Tenant Company</th>
              <th>Plan & Billing</th>
              <th>Monthly Value</th>
              <th>Status</th>
              <th>Period & Validity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((c) => {
              const plan = getPlan(c.planId);
              const left = daysUntil(c.endDate);
              const planPrice = plan?.custom
                ? 'Custom Scale'
                : `₹${plan?.monthlyPrice.toLocaleString('en-IN')}/mo`;

              return (
                <tr key={c.id}>
                  <td>
                    <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                      {c.name}
                    </Link>
                    <div className="sa-muted">
                      <span className="sa-code-badge">{c.code}</span> · {c.contactEmail}
                    </div>
                  </td>

                  <td>
                    <span className="sa-plan-tag">{plan?.name ?? c.planId}</span>
                    <div className="sa-muted" style={{ marginTop: '2px' }}>
                      {c.billingCycle === 'annual' ? 'Billed Annually (20% Off)' : 'Monthly Recurring'}
                    </div>
                  </td>

                  <td>
                    <strong style={{ fontSize: '0.9rem' }}>{planPrice}</strong>
                    <div className="sa-muted">{c.quotas.seats} user seats</div>
                  </td>

                  <td>
                    <StatusBadge status={c.status} />
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {c.startDate} → {c.endDate}
                    </div>
                    <span
                      className={`sa-days-pill ${
                        left < 0 ? 'overdue' : left <= 7 ? 'urgent' : 'ok'
                      }`}
                      style={{ marginTop: '2px' }}
                    >
                      {left < 0 ? `${Math.abs(left)}d overdue` : `${left}d left`}
                    </span>
                  </td>

                  <td>
                    <div className="sa-actions-cell">
                      <button
                        type="button"
                        className="btn btn-xs btn-secondary"
                        onClick={() => {
                          extendDays(c.id, 30);
                          toast.success(`Extended ${c.name} for 30 days`);
                        }}
                        title="Extend 30 Days"
                      >
                        +30 Days
                      </button>

                      <button
                        type="button"
                        className="btn btn-xs btn-outline"
                        onClick={() => handleSendInvoice(c)}
                        title="Send Tax Invoice"
                      >
                        <Send size={12} /> Invoice
                      </button>

                      <Link
                        to={`/superadmin/companies/${c.id}`}
                        className="btn btn-xs btn-outline"
                        title="Manage Subscription"
                      >
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
