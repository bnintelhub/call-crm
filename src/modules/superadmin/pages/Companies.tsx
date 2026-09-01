import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  Mail,
  UserCheck,
  PauseCircle,
  PlayCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan, PLANS } from '../data/catalog';
import { FEATURE_CATALOG } from '../data/catalog';
import { StatusBadge, daysUntil, formatWhen } from '../components/format';
import QuotaBar from '../components/QuotaBar';
import EmptyState from '../components/EmptyState';
import SendCredentialsModal from '../components/SendCredentialsModal';
import AdjustQuotaModal from '../components/AdjustQuotaModal';
import { toast } from '../../../components/shared/Toast';
import type { Company, OrgStatus } from '../types';

const STATUS_FILTERS: { id: 'all' | OrgStatus; label: string }[] = [
  { id: 'all', label: 'All Tenants' },
  { id: 'active', label: 'Active' },
  { id: 'trial', label: 'Trial' },
  { id: 'grace', label: 'Grace' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

export default function CompaniesPage() {
  const navigate = useNavigate();
  const companies = useSuperAdminStore((s) => s.companies);
  const setStatus = useSuperAdminStore((s) => s.setStatus);
  const extendDays = useSuperAdminStore((s) => s.extendDays);
  const impersonateCompany = useSuperAdminStore((s) => s.impersonateCompany);
  const deleteCompany = useSuperAdminStore((s) => s.deleteCompany);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]['id']>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Modals state
  const [credsModalCompany, setCredsModalCompany] = useState<Company | null>(null);
  const [quotaModalCompany, setQuotaModalCompany] = useState<Company | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchPlan = planFilter === 'all' || c.planId === planFilter;
      const haystack = `${c.name} ${c.code} ${c.city} ${c.contactName} ${c.contactEmail} ${c.legalName}`.toLowerCase();
      const matchQuery = !q.trim() || haystack.includes(q.toLowerCase());
      return matchStatus && matchPlan && matchQuery;
    });
  }, [companies, q, statusFilter, planFilter]);

  const handleToggleSuspend = (company: Company) => {
    if (company.status === 'suspended') {
      setStatus(company.id, 'active', 'Reactivated by Super Admin');
      toast.success(`${company.name} has been reactivated`);
    } else {
      setStatus(company.id, 'suspended', 'Suspended by Super Admin');
      toast.warning(`${company.name} suspended · Tenant access blocked`);
    }
  };

  const handleImpersonate = (company: Company) => {
    impersonateCompany(company.id);
    toast.success(`Impersonating ${company.name} · Super Admin view set`);
    navigate(`/superadmin/companies/${company.id}`);
  };

  return (
    <div className="sa-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <Building2 size={14} /> Tenant Governance
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <Building2 size={24} /> Companies (Tenants)
          </h1>
          <p className="page-subtitle">
            Manage multi-tenant subscriptions, assign modules, control seat quotas & dispatch admin logins.
          </p>
        </div>

        <Link to="/superadmin/companies/new" className="btn btn-primary">
          <Plus size={16} /> New Company
        </Link>
      </div>

      {/* Toolbar & Filters */}
      <div className="card sa-toolbar-card" style={{ marginBottom: '1.25rem' }}>
        <div className="sa-toolbar-row">
          {/* Search Box */}
          <div className="sa-search-input-field">
            <Search className="icon" size={16} />
            <input
              type="text"
              placeholder="Search company name, code, city, admin email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Plan Filter Dropdown */}
          <select
            className="sa-select-filter"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">All Plans</option>
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Chips */}
        <div className="sa-filters">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.id === 'all'
                ? companies.length
                : companies.filter((c) => c.status === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                className={`sa-chip ${statusFilter === f.id ? 'on' : ''}`}
                onClick={() => setStatusFilter(f.id)}
              >
                {f.label} <span className="sa-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Companies Table or Empty State */}
      {filteredCompanies.length === 0 ? (
        <EmptyState
          title={companies.length === 0 ? 'No Companies Provisioned Yet' : 'No Matching Companies Found'}
          description={
            companies.length === 0
              ? 'Get started by creating your first tenant company to allocate seats, select plans and assign CRM modules.'
              : `No companies match your filter criteria "${q}". Try clearing your search query or reset filters.`
          }
          actionText={companies.length === 0 ? 'Create New Company' : 'Reset All Filters'}
          onAction={() => {
            if (companies.length === 0) {
              navigate('/superadmin/companies/new');
            } else {
              setQ('');
              setStatusFilter('all');
              setPlanFilter('all');
            }
          }}
          icon={companies.length === 0 ? 'folder' : 'search'}
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Seats (Used/Total)</th>
                <th>Valid Till</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c) => {
                const plan = getPlan(c.planId);
                const left = daysUntil(c.endDate);

                return (
                  <tr key={c.id}>
                    {/* Company info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sa-company-avatar">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                            {c.name}
                          </Link>
                          <div className="sa-muted">
                            <span className="sa-code-badge">{c.code}</span> · {c.city} ·{' '}
                            {c.contactName} ({c.contactEmail})
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td>
                      <span className="sa-plan-tag">{plan?.name ?? c.planId}</span>
                      <div className="sa-muted" style={{ marginTop: '2px' }}>
                        {c.features.length} modules active
                      </div>
                    </td>

                    {/* Status badge */}
                    <td>
                      <StatusBadge status={c.status} />
                    </td>

                    {/* Seats quota bar */}
                    <td style={{ minWidth: '160px' }}>
                      <QuotaBar
                        compact
                        used={c.usage.seatsUsed}
                        max={c.quotas.seats}
                        suffix=" seats"
                      />
                    </td>

                    {/* Valid Till */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.endDate}</div>
                      <span
                        className={`sa-days-pill ${
                          left < 0 ? 'overdue' : left <= 7 ? 'urgent' : 'ok'
                        }`}
                        style={{ marginTop: '3px' }}
                      >
                        {left < 0 ? `${Math.abs(left)}d overdue` : left === 0 ? 'Today' : `${left}d left`}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="sa-actions-cell">
                        {/* View details */}
                        <Link
                          to={`/superadmin/companies/${c.id}`}
                          className="btn btn-xs btn-secondary"
                          title="View Details & Modules"
                        >
                          <Eye size={13} /> View
                        </Link>

                        {/* Impersonate */}
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => handleImpersonate(c)}
                          title="Impersonate Company Admin"
                        >
                          <UserCheck size={13} /> Impersonate
                        </button>

                        {/* Send credentials */}
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => setCredsModalCompany(c)}
                          title="Send Login Credentials"
                        >
                          <Mail size={13} /> Send Login
                        </button>

                        {/* Suspend / Reactivate */}
                        {c.status !== 'suspended' ? (
                          <button
                            type="button"
                            className="btn btn-xs btn-danger-outline"
                            onClick={() => handleToggleSuspend(c)}
                            title="Suspend Tenant"
                          >
                            <PauseCircle size={13} /> Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-xs btn-success-outline"
                            onClick={() => handleToggleSuspend(c)}
                            title="Reactivate Tenant"
                          >
                            <PlayCircle size={13} /> Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Send Credentials Modal */}
      {credsModalCompany && (
        <SendCredentialsModal
          company={credsModalCompany}
          onClose={() => setCredsModalCompany(null)}
        />
      )}

      {/* Adjust Quota Modal */}
      {quotaModalCompany && (
        <AdjustQuotaModal
          company={quotaModalCompany}
          onClose={() => setQuotaModalCompany(null)}
        />
      )}
    </div>
  );
}
