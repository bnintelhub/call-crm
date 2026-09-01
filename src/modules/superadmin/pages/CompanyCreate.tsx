import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import FeatureChecklist from '../components/FeatureChecklist';
import { EMPTY_QUOTAS, PLANS, getPlan } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { CompanyDraft, FeatureCode, Quotas } from '../types';

const STEPS = ['Company', 'Owner admin', 'Modules', 'Limits', 'Plan', 'Review'];

function addDays(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const initial: CompanyDraft = {
  name: '',
  legalName: '',
  city: '',
  gst: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  features: [...(getPlan('calling')?.features ?? [])],
  quotas: { ...(getPlan('calling')?.quotas ?? EMPTY_QUOTAS) },
  planId: 'calling',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: addDays(new Date().toISOString().slice(0, 10), 30),
  graceDays: 3,
};

export default function CompanyCreatePage() {
  const navigate = useNavigate();
  const addCompany = useSuperAdminStore((s) => s.addCompany);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CompanyDraft>(initial);

  const plan = useMemo(() => getPlan(draft.planId), [draft.planId]);

  const patch = (p: Partial<CompanyDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchQuota = (p: Partial<Quotas>) => setDraft((d) => ({ ...d, quotas: { ...d.quotas, ...p } }));

  const applyPlan = (planId: string) => {
    const next = getPlan(planId);
    if (!next) return;
    patch({
      planId,
      features: [...next.features],
      quotas: { ...next.quotas },
    });
  };

  const canNext = () => {
    if (step === 0) return draft.name.trim().length > 1 && draft.city.trim().length > 1;
    if (step === 1) return draft.contactName.trim() && draft.contactEmail.includes('@');
    if (step === 2) return draft.features.length > 0;
    return true;
  };

  const submit = () => {
    const company = addCompany(draft);
    toast.success(`${company.code} created. Admin invite: ${company.contactEmail}`);
    navigate(`/superadmin/companies/${company.id}`);
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Building2 size={24} /> New company</h1>
          <p className="page-subtitle">Provision a tenant: modules, seats, then Company Admin credentials.</p>
        </div>
      </div>

      <div className="sa-steps">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`sa-step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`}
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Company name</span>
              <input className="form-input" value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label className="sa-field">
              <span>Legal name</span>
              <input className="form-input" value={draft.legalName} onChange={(e) => patch({ legalName: e.target.value })} />
            </label>
            <label className="sa-field">
              <span>City</span>
              <input className="form-input" value={draft.city} onChange={(e) => patch({ city: e.target.value })} />
            </label>
            <label className="sa-field">
              <span>GST (optional)</span>
              <input className="form-input" value={draft.gst} onChange={(e) => patch({ gst: e.target.value })} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Admin name</span>
              <input className="form-input" value={draft.contactName} onChange={(e) => patch({ contactName: e.target.value })} />
            </label>
            <label className="sa-field">
              <span>Admin email</span>
              <input className="form-input" type="email" value={draft.contactEmail} onChange={(e) => patch({ contactEmail: e.target.value })} />
            </label>
            <label className="sa-field">
              <span>Mobile</span>
              <input className="form-input" value={draft.contactPhone} onChange={(e) => patch({ contactPhone: e.target.value })} />
            </label>
            <p className="sa-muted sa-field full">
              This person becomes Company Admin. They create supervisors and telecallers up to the seat limit. Super Admin does not create floor users.
            </p>
          </div>
        )}

        {step === 2 && (
          <FeatureChecklist
            value={draft.features}
            onChange={(features: FeatureCode[]) => patch({ features })}
          />
        )}

        {step === 3 && (
          <div className="sa-form-grid">
            {([
              ['seats', 'Total users'],
              ['supervisors', 'Supervisors'],
              ['telecallers', 'Telecallers'],
              ['concurrentAgents', 'Concurrent agents'],
              ['monthlyMinutes', 'Call minutes / month'],
              ['storageGb', 'Storage (GB)'],
              ['records', 'Customer/loan records'],
            ] as const).map(([key, label]) => (
              <label key={key} className="sa-field">
                <span>{label}</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  value={draft.quotas[key]}
                  onChange={(e) => patchQuota({ [key]: Number(e.target.value) })}
                />
              </label>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="sa-plan-grid">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`sa-plan-card ${draft.planId === p.id ? 'on' : ''}`}
                  onClick={() => applyPlan(p.id)}
                >
                  <h3>{p.name}</h3>
                  <p className="sa-muted">{p.tagline}</p>
                  <div className="sa-plan-price">{p.custom ? 'Custom' : `₹${p.monthlyPrice.toLocaleString('en-IN')}/mo`}</div>
                  <div className="sa-muted">{p.quotas.seats} seats</div>
                </button>
              ))}
            </div>
            <div className="sa-form-grid" style={{ marginTop: '1.25rem' }}>
              <label className="sa-field">
                <span>Start</span>
                <input className="form-input" type="date" value={draft.startDate} onChange={(e) => patch({ startDate: e.target.value })} />
              </label>
              <label className="sa-field">
                <span>End</span>
                <input className="form-input" type="date" value={draft.endDate} onChange={(e) => patch({ endDate: e.target.value })} />
              </label>
              <label className="sa-field">
                <span>Grace days</span>
                <input className="form-input" type="number" min={0} value={draft.graceDays} onChange={(e) => patch({ graceDays: Number(e.target.value) })} />
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="sa-review">
            <p><span>Company</span><strong>{draft.name} · {draft.city}</strong></p>
            <p><span>Admin</span><strong>{draft.contactName} · {draft.contactEmail}</strong></p>
            <p><span>Plan</span><strong>{plan?.name} · till {draft.endDate}</strong></p>
            <p><span>Modules</span><strong>{draft.features.join(', ')}</strong></p>
            <p><span>Capacity</span><strong>{draft.quotas.seats} seats · {draft.quotas.telecallers} telecallers · {draft.quotas.concurrentAgents} concurrent</strong></p>
            <p><span>Lock on expiry</span><strong>ON · {draft.graceDays} day grace</strong></p>
          </div>
        )}

        <div className="sa-wizard-nav">
          <button type="button" className="btn btn-secondary" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submit}>
              Create tenant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
