import { useState } from 'react';
import { Gauge, X, Save } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { useSuperAdminStore } from '../store';
import type { Company, Quotas } from '../types';

interface AdjustQuotaModalProps {
  company: Company | null;
  onClose: () => void;
}

export default function AdjustQuotaModal({ company, onClose }: AdjustQuotaModalProps) {
  const setQuotas = useSuperAdminStore((s) => s.setQuotas);
  const [quotas, setLocalQuotas] = useState<Quotas>(
    company?.quotas || {
      seats: 10,
      supervisors: 2,
      telecallers: 8,
      concurrentAgents: 5,
      monthlyMinutes: 10000,
      storageGb: 10,
      records: 25000,
    }
  );

  if (!company) return null;

  const patch = (p: Partial<Quotas>) => setLocalQuotas((q) => ({ ...q, ...p }));

  const handleSave = () => {
    setQuotas(company.id, quotas);
    toast.success(`Updated resource limits for ${company.name}`);
    onClose();
  };

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-header">
          <div className="sa-modal-title-wrap">
            <div className="sa-modal-icon-badge">
              <Gauge size={20} />
            </div>
            <div>
              <h3 className="sa-modal-title">Adjust Capacity Limits</h3>
              <p className="sa-modal-subtitle">
                Override resource quotas for <strong>{company.name}</strong> ({company.code})
              </p>
            </div>
          </div>
          <button type="button" className="sa-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sa-modal-body">
          <div className="sa-form-grid">
            <label className="sa-field">
              <span>Total Seats</span>
              <input
                className="form-input"
                type="number"
                min={1}
                value={quotas.seats}
                onChange={(e) => patch({ seats: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field">
              <span>Telecaller Floor Seats</span>
              <input
                className="form-input"
                type="number"
                min={0}
                value={quotas.telecallers}
                onChange={(e) => patch({ telecallers: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field">
              <span>Supervisors / Leads</span>
              <input
                className="form-input"
                type="number"
                min={0}
                value={quotas.supervisors}
                onChange={(e) => patch({ supervisors: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field">
              <span>Concurrent Live Channels</span>
              <input
                className="form-input"
                type="number"
                min={0}
                value={quotas.concurrentAgents}
                onChange={(e) => patch({ concurrentAgents: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field">
              <span>Monthly Call Minutes</span>
              <input
                className="form-input"
                type="number"
                step={5000}
                min={0}
                value={quotas.monthlyMinutes}
                onChange={(e) => patch({ monthlyMinutes: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field">
              <span>Audio/Doc Storage (GB)</span>
              <input
                className="form-input"
                type="number"
                min={1}
                value={quotas.storageGb}
                onChange={(e) => patch({ storageGb: Number(e.target.value) })}
              />
            </label>
            <label className="sa-field full">
              <span>Max Loan / Debtor Records Cap</span>
              <input
                className="form-input"
                type="number"
                step={10000}
                min={1000}
                value={quotas.records}
                onChange={(e) => patch({ records: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="sa-modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <Save size={15} /> Save Limit Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
