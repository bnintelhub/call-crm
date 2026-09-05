import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Key,
  Copy,
  CheckCircle2,
  Send,
  PowerOff,
  Play,
  Trash2,
  Ban,
  AlertTriangle,
  X,
  RotateCw,
  BellRing,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { getPlan } from '../data/catalog';
import { FEATURE_CATALOG } from '../data/catalog';
import { StatusBadge, daysUntil, formatWhen } from '../components/format';
import SendCredentialsModal from '../components/SendCredentialsModal';
import RenewCompanyModal from '../components/RenewCompanyModal';
import { toast } from '../../../components/shared/Toast';
import type { Company, OrgStatus } from '../types';

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
  const stopCompany = useSuperAdminStore((s) => s.stopCompany);
  const resumeCompany = useSuperAdminStore((s) => s.resumeCompany);
  const deleteCompany = useSuperAdminStore((s) => s.deleteCompany);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<(typeof FILTERS)[number]['id']>('all');
  const [selectedCredsCompany, setSelectedCredsCompany] = useState<Company | null>(null);
  const [companyToRenew, setCompanyToRenew] = useState<Company | null>(null);
  const [companyToStop, setCompanyToStop] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return companies.filter((c) => {
      const matchStatus = status === 'all' || c.status === status;
      const hay = `${c.name || ''} ${c.code || ''} ${c.city || ''} ${c.contactEmail || ''} ${c.loginEmail || ''} ${c.activationKey || ''}`.toLowerCase();
      return matchStatus && hay.includes(q.toLowerCase());
    });
  }, [companies, q, status]);

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    toast.success('Activation key copied');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleConfirmStop = () => {
    if (!companyToStop) return;
    stopCompany(companyToStop.id);
    toast.warning(`Company ${companyToStop.name} stopped. Activation key deactivated.`);
    setCompanyToStop(null);
  };

  const handleResume = (c: Company) => {
    resumeCompany(c.id);
    toast.success(`Company ${c.name} resumed. Activation key reactivated.`);
  };

  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    deleteCompany(companyToDelete.id);
    toast.success(`Company ${companyToDelete.name} (${companyToDelete.code}) permanently deleted.`);
    setCompanyToDelete(null);
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Building2 size={24} /> Companies</h1>
          <p className="page-subtitle">Tenants you sell to — with 16-digit activation keys, user billing & module limits.</p>
        </div>
        <Link to="/superadmin/companies/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <Plus size={16} /> New company
        </Link>
      </div>

      <div className="sa-toolbar">
        <div className="form-input-icon" style={{ flex: 1 }}>
          <Search className="icon" size={16} />
          <input
            className="form-input"
            placeholder="Search name, code, city, admin email, login ID, activation key"
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
              <th>Activation Key</th>
              <th>Users & Billing</th>
              <th>Modules</th>
              <th>Valid till</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const left = c.endDate ? daysUntil(c.endDate) : 0;
              const userCount = c.quotas?.telecallers || c.quotas?.seats || 10;
              const monthlyAmount = c.totalMonthlyBilling != null ? c.totalMonthlyBilling : userCount * (c.pricePerUser || 2000);
              const activationKey = c.activationKey || `BN10-${(c.name || 'OR').slice(0, 2).toUpperCase()}X1-2609-P4Q8`;
              const isStopped = c.status === 'suspended' || c.activationKeyStatus === 'deactivated';

              return (
                <tr key={c.id}>
                  <td>
                    <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link" style={{ fontWeight: 600 }}>
                      {c.name}
                    </Link>
                    {c.renewalRequested && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#d97706',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          marginLeft: '0.4rem',
                          verticalAlign: 'middle',
                        }}
                        title="Supervisor requested renewal from portal"
                      >
                        <BellRing size={10} /> Renewal Requested
                      </span>
                    )}
                    <div className="sa-muted" style={{ fontSize: '0.75rem' }}>
                      {c.code} · {c.city} · <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{c.loginEmail || c.contactEmail}</strong>
                    </div>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {isStopped ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <code
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              textDecoration: 'line-through',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#ef4444',
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              fontWeight: 700,
                            }}
                          >
                            {activationKey}
                          </code>
                        </div>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.12)',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            width: 'fit-content',
                          }}
                        >
                          <Ban size={9} /> Deactivated
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            background: 'rgba(16, 185, 129, 0.08)',
                            color: 'var(--accent-success)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            fontWeight: 700,
                          }}
                        >
                          {activationKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyKey(c.id, activationKey)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: copiedKeyId === c.id ? 'var(--accent-success)' : 'var(--text-muted)',
                            padding: 2,
                          }}
                          title="Copy key"
                        >
                          {copiedKeyId === c.id ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {userCount} Users
                    </strong>
                    <div className="sa-muted" style={{ fontSize: '0.75rem' }}>
                      ₹{monthlyAmount.toLocaleString('en-IN')}/mo (Internal)
                    </div>
                  </td>
                  <td>
                    <div className="sa-modules">
                      {c.features.slice(0, 3).map((code) => (
                        <span key={code} className="sa-mod">
                          {FEATURE_CATALOG.find((f) => f.code === code)?.label ?? code}
                        </span>
                      ))}
                      {c.features.length > 3 && <span className="sa-mod">+{c.features.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{c.endDate}</div>
                    <div className="sa-muted" style={{ fontSize: '0.72rem' }}>
                      {left < 0 ? `${Math.abs(left)}d overdue` : `${left}d left`}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'nowrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setCompanyToRenew(c)}
                        title={c.renewalRequested ? 'Supervisor requested subscription renewal! Click to renew & generate key' : 'Renew company subscription & generate new key'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.5rem',
                          background: c.renewalRequested ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.08)',
                          color: 'var(--accent-primary)',
                          border: c.renewalRequested ? '1.5px solid var(--accent-primary)' : '1px solid rgba(99, 102, 241, 0.25)',
                          fontWeight: 700,
                        }}
                      >
                        <RotateCw size={11} />
                        <span>Renew</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCredsCompany(c)}
                        title="Send / Copy Credentials"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Send size={11} />
                        <span>Key</span>
                      </button>

                      {isStopped ? (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => handleResume(c)}
                          title="Resume company operations & reactivate key"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: 'var(--accent-success, #10b981)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontWeight: 600,
                          }}
                        >
                          <Play size={11} />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => setCompanyToStop(c)}
                          title="Stop company operations & deactivate key"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontWeight: 600,
                          }}
                        >
                          <PowerOff size={11} />
                          <span>Stop</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => setCompanyToDelete(c)}
                        title="Delete company permanently"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Send / Copy Credentials */}
      {selectedCredsCompany && (
        <SendCredentialsModal company={selectedCredsCompany} onClose={() => setSelectedCredsCompany(null)} />
      )}

      {/* Modal: Renew Company Subscription & Issue Key */}
      {companyToRenew && (
        <RenewCompanyModal
          company={companyToRenew}
          onClose={() => setCompanyToRenew(null)}
          onRenewSuccess={(renewed) => {
            setCompanyToRenew(null);
            setSelectedCredsCompany(renewed);
          }}
        />
      )}

      {/* Modal: Confirm Stop Company & Deactivate Key */}
      {companyToStop && (
        <div className="sa-modal-backdrop" onClick={() => setCompanyToStop(null)}>
          <div className="sa-modal-dialog animate-scale-up" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title-wrap">
                <div className="sa-modal-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <PowerOff size={20} />
                </div>
                <div>
                  <h3 className="sa-modal-title">Stop Company & Deactivate Key</h3>
                  <p className="sa-modal-subtitle">{companyToStop.name} ({companyToStop.code})</p>
                </div>
              </div>
              <button type="button" className="sa-modal-close-btn" onClick={() => setCompanyToStop(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="sa-modal-body">
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Stopping this company will immediately:
                  <ul style={{ margin: '0.4rem 0 0 1rem', padding: 0 }}>
                    <li>Set company status to <strong>Suspended</strong></li>
                    <li><strong>Deactivate the 16-Digit Activation Key:</strong> <code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ef4444' }}>{companyToStop.activationKey}</code></li>
                    <li>Block all Supervisor & Telecaller portal logins</li>
                  </ul>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                You can restore access and reactivate the activation key at any time by clicking <strong>Resume</strong>.
              </p>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCompanyToStop(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmStop}
                style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 700 }}
              >
                <PowerOff size={15} /> Confirm Stop & Deactivate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete Company */}
      {companyToDelete && (
        <div className="sa-modal-backdrop" onClick={() => setCompanyToDelete(null)}>
          <div className="sa-modal-dialog animate-scale-up" style={{ maxWidth: '480px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal-header">
              <div className="sa-modal-title-wrap">
                <div className="sa-modal-icon-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="sa-modal-title">Delete Company Permanently</h3>
                  <p className="sa-modal-subtitle">{companyToDelete.name} ({companyToDelete.code})</p>
                </div>
              </div>
              <button type="button" className="sa-modal-close-btn" onClick={() => setCompanyToDelete(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="sa-modal-body">
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '0.875rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Warning: This action cannot be undone.</strong>
                  <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)' }}>
                    Deleting <strong>{companyToDelete.name}</strong> will remove all tenant settings, activation key, quotas, and login credentials from the platform.
                  </p>
                </div>
              </div>
            </div>
            <div className="sa-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setCompanyToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                style={{ fontWeight: 700 }}
              >
                <Trash2 size={15} /> Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
