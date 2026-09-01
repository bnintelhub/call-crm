import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan } from '../data/catalog';
import { FEATURE_CATALOG } from '../data/catalog';
import { StatusBadge, daysUntil, formatWhen } from '../components/format';
import type { OrgStatus } from '../types';

const FILTERS: { id: 'all' | OrgStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'trial', label: 'Trial' },
  { id: 'grace', label: 'Grace' },
  { id: 'expired', label: 'Expired' },
  { id: 'suspended', label: 'Suspended' },
];

export default function CompaniesPage() {
  const companies = useSuperAdminStore((s) => s.companies);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof FILTERS)[number]['id']>('all');

  const rows = useMemo(() => {
    return companies.filter((c) => {
      const matchStatus = status === 'all' || c.status === status;
      const hay = `${c.name} ${c.code} ${c.city} ${c.contactEmail}`.toLowerCase();
      return matchStatus && hay.includes(q.toLowerCase());
    });
  }, [companies, q, status]);

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Building2 size={24} /> Companies</h1>
          <p className="page-subtitle">Tenants you sell to — not their customers or live calls.</p>
        </div>
        <Link to="/superadmin/companies/new" className="btn btn-primary">
          <Plus size={16} /> New company
        </Link>
      </div>

      <div className="sa-toolbar">
        <div className="form-input-icon" style={{ flex: 1 }}>
          <Search className="icon" size={16} />
          <input
            className="form-input"
            placeholder="Search name, code, city, admin email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="sa-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`sa-chip ${status === f.id ? 'on' : ''}`}
              onClick={() => setStatus(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Modules</th>
              <th>Seats</th>
              <th>Valid till</th>
              <th>Last login</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const left = daysUntil(c.endDate);
              return (
                <tr key={c.id}>
                  <td>
                    <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">{c.name}</Link>
                    <div className="sa-muted">{c.code} · {c.city} · {c.contactEmail}</div>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{getPlan(c.planId)?.name ?? c.planId}</td>
                  <td>
                    <div className="sa-modules">
                      {c.features.slice(0, 4).map((code) => (
                        <span key={code} className="sa-mod">
                          {FEATURE_CATALOG.find((f) => f.code === code)?.label ?? code}
                        </span>
                      ))}
                      {c.features.length > 4 && <span className="sa-mod">+{c.features.length - 4}</span>}
                    </div>
                  </td>
                  <td>{c.usage.seatsUsed} / {c.quotas.seats}</td>
                  <td>
                    {c.endDate}
                    <div className="sa-muted">{left < 0 ? `${Math.abs(left)}d overdue` : `${left}d left`}</div>
                  </td>
                  <td>{formatWhen(c.lastLogin)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
