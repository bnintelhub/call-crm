import { Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuotaBar from '../components/QuotaBar';
import { StatusBadge, quotaPct } from '../components/format';
import { useSuperAdminStore } from '../store';

export default function UsagePage() {
  const companies = useSuperAdminStore((s) => s.companies);

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Gauge size={24} /> Resource usage</h1>
          <p className="page-subtitle">What you allocated vs what each tenant used. No borrower names here.</p>
        </div>
      </div>

      <div className="sa-list">
        {companies.map((c) => {
          const hot = Math.max(
            quotaPct(c.usage.seatsUsed, c.quotas.seats),
            quotaPct(c.usage.minutesUsed, c.quotas.monthlyMinutes),
            quotaPct(c.usage.storageUsedGb, c.quotas.storageGb),
          );
          return (
            <div key={c.id} className="card">
              <div className="card-header-row">
                <div>
                  <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">{c.name}</Link>
                  <div className="sa-muted">{c.code} · peak resource {hot}%</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="sa-form-grid">
                <QuotaBar label="Seats" used={c.usage.seatsUsed} max={c.quotas.seats} />
                <QuotaBar label="Telecallers" used={c.usage.telecallersUsed} max={c.quotas.telecallers} />
                <QuotaBar label="Minutes" used={c.usage.minutesUsed} max={c.quotas.monthlyMinutes} />
                <QuotaBar label="Storage GB" used={c.usage.storageUsedGb} max={c.quotas.storageGb} suffix=" GB" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
