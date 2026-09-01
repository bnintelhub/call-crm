import { useMemo, useState } from 'react';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  Shield,
  Clock,
  Building2,
  Lock,
  Sliders,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { formatWhen } from '../components/format';
import { useSuperAdminStore } from '../store';
import EmptyState from '../components/EmptyState';
import { toast } from '../../../components/shared/Toast';

const CATEGORIES = [
  { id: 'all', label: 'All Activities' },
  { id: 'company', label: 'Company Lifecycle' },
  { id: 'security', label: 'Security & Impersonation' },
  { id: 'subscription', label: 'Subscriptions & Grace' },
  { id: 'limits', label: 'Capacity & Quotas' },
  { id: 'modules', label: 'Module Changes' },
];

export default function AuditLogsPage() {
  const audits = useSuperAdminStore((s) => s.audits);
  const [q, setQ] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return audits.filter((a) => {
      const matchCat = selectedCat === 'all' || a.category === selectedCat;
      const haystack = `${a.action} ${a.companyCode} ${a.detail} ${a.actor}`.toLowerCase();
      const matchQ = !q.trim() || haystack.includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [audits, q, selectedCat]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'CompanyCode', 'Category', 'Detail'];
    const rows = filteredLogs.map((a) => [
      `"${a.at}"`,
      `"${a.actor}"`,
      `"${a.action}"`,
      `"${a.companyCode}"`,
      `"${a.category || 'general'}"`,
      `"${a.detail.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bnorbit-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log CSV exported successfully');
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <ScrollText size={14} /> Security Compliance
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <ScrollText size={24} /> Platform Audit Trail
          </h1>
          <p className="page-subtitle">
            Immutable log of Super Admin interventions, tenant lifecycle events, quota overrides & security events.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card sa-toolbar-card" style={{ marginBottom: '1.25rem' }}>
        <div className="sa-toolbar-row">
          <div className="sa-search-input-field">
            <Search className="icon" size={15} />
            <input
              type="text"
              placeholder="Search action, actor, company code, or details..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="sa-filters">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? audits.length
                : audits.filter((a) => a.category === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                className={`sa-chip ${selectedCat === cat.id ? 'on' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.label} <span className="sa-chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description={`No recorded system events match your search query "${q}".`}
          actionText="Reset Filters"
          onAction={() => {
            setQ('');
            setSelectedCat('all');
          }}
          icon="search"
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Company</th>
                <th>Audit Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((a) => {
                const isSecurity =
                  a.category === 'security' || a.action.toLowerCase().includes('suspend') || a.action.toLowerCase().includes('lock') || a.action.toLowerCase().includes('impersonate');

                return (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{formatWhen(a.at)}</div>
                      <span className="sa-muted" style={{ fontSize: '0.72rem' }}>
                        {a.at.slice(0, 10)}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${a.actor.includes('System') ? 'badge-info' : 'badge-primary'}`}>
                        {a.actor}
                      </span>
                    </td>

                    <td>
                      <strong style={{ color: isSecurity ? '#ef4444' : 'var(--text-primary)' }}>
                        {a.action}
                      </strong>
                    </td>

                    <td>
                      <span className="sa-code-badge">{a.companyCode}</span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {a.detail}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
