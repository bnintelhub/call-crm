import { useState } from 'react';
import { Layers, Plus, Edit3, Trash2, PhoneCall, Phone, CheckCircle2, RotateCcw } from 'lucide-react';
import { FEATURE_CATALOG } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import PlanModal from '../components/PlanModal';
import { toast } from '../../../components/shared/Toast';
import type { Plan } from '../types';

export default function PlansPage() {
  const plans = useSuperAdminStore((s) => s.plans);
  const deletePlan = useSuperAdminStore((s) => s.deletePlan);
  const resetPlansToDefault = useSuperAdminStore((s) => s.resetPlansToDefault);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = (plan: Plan) => {
    if (plans.length <= 1) {
      toast.error('At least one plan must remain in the catalog');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the plan "${plan.name}"?`)) {
      deletePlan(plan.id);
      toast.success(`Deleted plan "${plan.name}"`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all plans to the 2 standard defaults (Manual Calling & Auto IVR)?')) {
      resetPlansToDefault();
      toast.success('Plans reset to standard defaults');
    }
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title"><Layers size={24} /> Plans</h1>
          <p className="page-subtitle">
            Configure subscription tiers: Manual Calling (Without IVR) vs Auto Calling (With IVR), and custom plans.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetDefaults}
            title="Reset to 2 Default Plans"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}
          >
            <Plus size={18} />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      <div className="sa-plan-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {plans.map((p) => {
          const isManual = p.callingType === 'manual' || !p.hasIvr;
          return (
            <div
              key={p.id}
              className="sa-plan-card"
              style={{
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isManual ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                {/* Top Header Badge Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                      {p.name}
                    </h3>
                    <p className="sa-muted" style={{ fontSize: '0.8125rem', margin: 0, minHeight: '36px' }}>
                      {p.tagline}
                    </p>
                  </div>

                  {isManual ? (
                    <span
                      className="badge badge-warning"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        padding: '0.3rem 0.65rem',
                        flexShrink: 0
                      }}
                    >
                      <Phone size={12} /> Without IVR
                    </span>
                  ) : (
                    <span
                      className="badge badge-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        padding: '0.3rem 0.65rem',
                        flexShrink: 0
                      }}
                    >
                      <PhoneCall size={12} /> With IVR
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div style={{ margin: '1rem 0 1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {p.monthlyPrice === 0 ? 'Custom' : `₹${p.monthlyPrice.toLocaleString('en-IN')}`}
                    </span>
                    {p.monthlyPrice > 0 && (
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ month</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {isManual ? 'Manual calling only · No IVR menus' : 'Full automation · Inbound IVR & recordings included'}
                  </div>
                </div>

                {/* Quotas & Capacity Overview */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Capacity Limits
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Seats: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.quotas.seats}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}> ({p.quotas.telecallers} TC / {p.quotas.supervisors} Sup)</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Lines: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {p.quotas.concurrentAgents > 0 ? `${p.quotas.concurrentAgents} concurrent` : 'Manual dial'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Minutes: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {p.quotas.monthlyMinutes > 0 ? `${p.quotas.monthlyMinutes.toLocaleString('en-IN')}/mo` : 'Unlimited manual'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Records: </span>
                      <strong style={{ color: 'var(--text-primary)' }}>{p.quotas.records.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Modules Included */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Included Modules ({p.features.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {p.features.map((code) => {
                      const def = FEATURE_CATALOG.find((f) => f.code === code);
                      const isIvrSpecific = code.startsWith('ivr_') || code === 'call_recordings';
                      return (
                        <span
                          key={code}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: isIvrSpecific ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                            color: isIvrSpecific ? 'var(--accent-primary-light)' : 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <CheckCircle2 size={11} />
                          {def?.label ?? code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.875rem',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '0.5rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenEdit(p)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <Edit3 size={14} />
                  <span>Edit Plan</span>
                </button>

                {plans.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleDelete(p)}
                    title="Delete plan"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'transparent',
                      color: 'var(--accent-danger)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
}
