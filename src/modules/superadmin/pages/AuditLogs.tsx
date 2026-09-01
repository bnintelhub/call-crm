import { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { formatWhen } from '../components/format';
import { useSuperAdminStore } from '../store';

export default function AuditLogsPage() {
  const audits = useSuperAdminStore((s) => s.audits);
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const hay = q.toLowerCase();
    return audits.filter((a) => `${a.action} ${a.companyCode} ${a.detail} ${a.actor}`.toLowerCase().includes(hay));
  }, [audits, q]);

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><ScrollText size={24} /> Audit logs</h1>
          <p className="page-subtitle">Platform actions only — create, suspend, module and limit changes.</p>
        </div>
      </div>

      <div className="sa-toolbar">
        <input
          className="form-input"
          placeholder="Filter by company code or action"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Company</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{formatWhen(a.at)}</td>
                <td>{a.actor}</td>
                <td>{a.action}</td>
                <td>{a.companyCode}</td>
                <td>{a.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
