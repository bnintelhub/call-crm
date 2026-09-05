import { useState } from 'react';
import { X, Layers, PhoneCall, Phone, Check, ShieldCheck, Headphones } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { FEATURE_CATALOG, EMPTY_QUOTAS } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { FeatureCode, Plan, Quotas } from '../types';

interface PlanModalProps {
  plan?: Plan | null;
  onClose: () => void;
}

const DEFAULT_MANUAL_MODULES: FeatureCode[] = [
  'dashboard',
  'my_data',
  'reports',
  'team_performance',
  'monitoring',
  'allocation',
  'campaigns',
  'ptp_tasks',
  'whatsapp',
];

const DEFAULT_IVR_MODULES: FeatureCode[] = [
  'dashboard',
  'my_data',
  'reports',
  'team_performance',
  'monitoring',
  'allocation',
  'campaigns',
  'ptp_tasks',
  'whatsapp',
  'ivr_inbound',
  'ivr_agent_groups',
  'call_recordings',
  'ivr_incentives',
];

export default function PlanModal({ plan, onClose }: PlanModalProps) {
  const addPlan = useSuperAdminStore((s) => s.addPlan);
  const updatePlan = useSuperAdminStore((s) => s.updatePlan);

  const isEditing = Boolean(plan);

  const [name, setName] = useState(plan?.name || '');
  const [tagline, setTagline] = useState(plan?.tagline || '');
  const [monthlyPrice, setMonthlyPrice] = useState<number>(plan?.monthlyPrice ?? (plan?.hasIvr ? 35000 : 12000));
  const [hasIvr, setHasIvr] = useState<boolean>(plan?.hasIvr ?? false);
  const [callingType, setCallingType] = useState<'manual' | 'auto'>(plan?.callingType ?? (plan?.hasIvr ? 'auto' : 'manual'));
  const [features, setFeatures] = useState<FeatureCode[]>(plan?.features || (plan?.hasIvr ? DEFAULT_IVR_MODULES : DEFAULT_MANUAL_MODULES));
  const [quotas, setQuotas] = useState<Quotas>(plan?.quotas || { ...EMPTY_QUOTAS });

  const handleCallingModeChange = (mode: 'manual' | 'auto') => {
    setCallingType(mode);
    if (mode === 'manual') {
      setHasIvr(false);
      if (!isEditing || features.some(f => f.startsWith('ivr_') || f === 'call_recordings')) {
        setFeatures(DEFAULT_MANUAL_MODULES);
        if (!isEditing) setMonthlyPrice(12000);
      }
    } else {
      setHasIvr(true);
      if (!isEditing || !features.some(f => f.startsWith('ivr_'))) {
        setFeatures(DEFAULT_IVR_MODULES);
        if (!isEditing) setMonthlyPrice(35000);
      }
    }
  };

  const toggleFeature = (code: FeatureCode) => {
    if (features.includes(code)) {
      setFeatures(features.filter((f) => f !== code));
    } else {
      setFeatures([...features, code]);
    }
  };

  const selectAllCore = () => {
    const coreCodes = FEATURE_CATALOG.filter(f => f.group === 'core').map(f => f.code);
    const nonCore = features.filter(f => !coreCodes.includes(f));
    setFeatures([...nonCore, ...coreCodes]);
  };

  const selectAllIvr = () => {
    const ivrCodes = FEATURE_CATALOG.filter(f => f.group === 'ivr').map(f => f.code);
    const nonIvr = features.filter(f => !ivrCodes.includes(f));
    setFeatures([...nonIvr, ...ivrCodes]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }

    if (features.length === 0) {
      toast.error('Select at least one module for this plan');
      return;
    }

    const payload = {
      name: name.trim(),
      tagline: tagline.trim() || (hasIvr ? 'Inbound IVR + Outbound Calling Suite' : 'Collection CRM with Manual Click-to-Call (Without IVR)'),
      monthlyPrice: Number(monthlyPrice) || 0,
      hasIvr,
      callingType,
      features,
      quotas,
    };

    if (isEditing && plan) {
      updatePlan(plan.id, payload);
      toast.success(`Plan "${payload.name}" updated successfully`);
    } else {
      addPlan(payload);
      toast.success(`Plan "${payload.name}" created successfully`);
    }

    onClose();
  };

  const coreModules = FEATURE_CATALOG.filter((f) => f.group === 'core');
  const ivrModules = FEATURE_CATALOG.filter((f) => f.group === 'ivr');

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div
        className="sa-modal-dialog animate-scale-up"
        style={{ maxWidth: '720px', width: '94%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sa-modal-header">
          <div className="sa-modal-title-wrap">
            <div className="sa-modal-icon-badge">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="sa-modal-title">{isEditing ? 'Edit Plan' : 'Create New Plan'}</h3>
              <p className="sa-modal-subtitle">
                {isEditing ? `Modify plan configuration for "${plan?.name}"` : 'Configure pricing, IVR mode, and supervisor modules'}
              </p>
            </div>
          </div>
          <button type="button" className="sa-modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="sa-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Row 1: Name & Price */}
            <div className="sa-form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <label className="sa-field">
                <span>Plan Name *</span>
                <input
                  className="form-input"
                  placeholder="e.g. Manual Calling (No IVR)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="sa-field">
                <span>Monthly Price (₹) *</span>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  step={500}
                  value={monthlyPrice}
                  onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                  required
                />
              </label>
            </div>

            {/* Row 2: Tagline */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="sa-field">
                <span>Short Tagline / Description</span>
                <input
                  className="form-input"
                  placeholder="e.g. Full Collection CRM with manual click-to-call, no IVR"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </label>
            </div>

            {/* Row 3: Calling & IVR Mode Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Calling & IVR Architecture *
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleCallingModeChange('manual')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${callingType === 'manual' && !hasIvr ? 'var(--accent-warning)' : 'var(--border-color)'}`,
                    background: callingType === 'manual' && !hasIvr ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: callingType === 'manual' ? 'var(--accent-warning)' : 'var(--bg-tertiary)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Phone size={14} />
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Without IVR (Manual)</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Telecaller dials manually from customer screen. No IVR queues, trees, or inbound routing.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCallingModeChange('auto')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${hasIvr ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    background: hasIvr ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: hasIvr ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <PhoneCall size={14} />
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>With IVR (Auto Calling)</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Full suite: Inbound IVR trees + auto routing + IVR agent groups + call recordings.
                  </span>
                </button>
              </div>
            </div>

            {/* Row 4: Core Supervisor Modules Checklist */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={16} color="var(--accent-success)" />
                  Core Supervisor Modules ({coreModules.filter(m => features.includes(m.code)).length}/{coreModules.length})
                </span>
                <button
                  type="button"
                  onClick={selectAllCore}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Select All Core
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.5rem' }}>
                {coreModules.map((f) => {
                  const checked = features.includes(f.code);
                  return (
                    <label
                      key={f.code}
                      onClick={() => toggleFeature(f.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${checked ? 'var(--border-active)' : 'var(--border-color)'}`,
                        background: checked ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        userSelect: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                          background: checked ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {checked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {f.hint}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Row 5: IVR Specific Modules Checklist */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Headphones size={16} color="var(--accent-primary)" />
                  IVR Call Specific Modules ({ivrModules.filter(m => features.includes(m.code)).length}/{ivrModules.length})
                </span>
                <button
                  type="button"
                  onClick={selectAllIvr}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Select All IVR
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.5rem' }}>
                {ivrModules.map((f) => {
                  const checked = features.includes(f.code);
                  return (
                    <label
                      key={f.code}
                      onClick={() => toggleFeature(f.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${checked ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)'}`,
                        background: checked ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        userSelect: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                          background: checked ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}
                      >
                        {checked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {f.hint}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Row 6: Limits / Quotas */}
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Capacity Limits & Quotas
              </span>
              <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <label className="sa-field">
                  <span>Total Seats</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={quotas.seats}
                    onChange={(e) => setQuotas({ ...quotas, seats: Number(e.target.value) })}
                  />
                </label>
                <label className="sa-field">
                  <span>Telecallers</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={quotas.telecallers}
                    onChange={(e) => setQuotas({ ...quotas, telecallers: Number(e.target.value) })}
                  />
                </label>
                <label className="sa-field">
                  <span>Supervisors</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={quotas.supervisors}
                    onChange={(e) => setQuotas({ ...quotas, supervisors: Number(e.target.value) })}
                  />
                </label>
                <label className="sa-field">
                  <span>Concurrent Lines</span>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    value={quotas.concurrentAgents}
                    onChange={(e) => setQuotas({ ...quotas, concurrentAgents: Number(e.target.value) })}
                  />
                </label>
                <label className="sa-field">
                  <span>Call Minutes / Mo</span>
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={5000}
                    value={quotas.monthlyMinutes}
                    onChange={(e) => setQuotas({ ...quotas, monthlyMinutes: Number(e.target.value) })}
                  />
                </label>
                <label className="sa-field">
                  <span>Max Records</span>
                  <input
                    className="form-input"
                    type="number"
                    min={1000}
                    step={10000}
                    value={quotas.records}
                    onChange={(e) => setQuotas({ ...quotas, records: Number(e.target.value) })}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="sa-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 600 }}>
              {isEditing ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
