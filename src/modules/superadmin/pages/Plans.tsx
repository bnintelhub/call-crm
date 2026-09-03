import { Layers } from 'lucide-react';
import { FEATURE_CATALOG, PLANS } from '../data/catalog';

export default function PlansPage() {
  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Layers size={24} /> Plans</h1>
          <p className="page-subtitle">Catalog Super Admin attaches while creating a company. Enterprise stays custom.</p>
        </div>
      </div>

      <div className="sa-plan-grid">
        {PLANS.map((p) => (
          <div key={p.id} className="sa-plan-card" style={{ cursor: 'default' }}>
            <h3>{p.name}</h3>
            <p className="sa-muted">{p.tagline}</p>
            <div className="sa-plan-price">{p.custom ? 'Custom' : `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo`}</div>
            <p className="sa-muted">{p.quotas.seats} seats · {p.quotas.telecallers} telecallers</p>
            <p className="sa-muted">{p.quotas.concurrentAgents} concurrent · {p.quotas.monthlyMinutes.toLocaleString('en-IN')} min</p>
            <div className="sa-modules" style={{ marginTop: '0.75rem' }}>
              {p.features.map((code) => (
                <span key={code} className="sa-mod">
                  {FEATURE_CATALOG.find((f) => f.code === code)?.label ?? code}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
