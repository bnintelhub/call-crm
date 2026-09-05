import type { FeatureCode } from '../types';
import { FEATURE_CATALOG } from '../data/catalog';
import { ShieldCheck, Headphones, Check, Layers, Sparkles } from 'lucide-react';

interface FeatureChecklistProps {
  value: FeatureCode[];
  onChange: (next: FeatureCode[]) => void;
}

export default function FeatureChecklist({ value, onChange }: FeatureChecklistProps) {
  const coreModules = FEATURE_CATALOG.filter((f) => f.group === 'core');
  const ivrModules = FEATURE_CATALOG.filter((f) => f.group === 'ivr');

  const toggle = (code: FeatureCode, dependsOn: FeatureCode[] = []) => {
    const on = value.includes(code);
    if (on) {
      const blocked = new Set<FeatureCode>([code]);
      FEATURE_CATALOG.forEach((f) => {
        if (f.dependsOn.some((d) => blocked.has(d))) blocked.add(f.code);
      });
      onChange(value.filter((c) => !blocked.has(c)));
      return;
    }
    const missing = dependsOn.filter((d) => !value.includes(d));
    onChange([...value, ...missing, code]);
  };

  const selectCoreOnly = () => {
    const coreCodes = coreModules.map((m) => m.code);
    onChange(coreCodes);
  };

  const selectAllWithIvr = () => {
    const allCodes = [...coreModules.map((m) => m.code), ...ivrModules.map((m) => m.code)];
    onChange(allCodes);
  };

  const clearAll = () => {
    onChange([]);
  };

  const isFullSuite =
    value.length === coreModules.length + ivrModules.length &&
    [...coreModules, ...ivrModules].every((m) => value.includes(m.code));
  const isCoreOnly =
    value.length === coreModules.length &&
    coreModules.every((m) => value.includes(m.code));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Quick Action Presets Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} className="text-primary" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Selected: <strong style={{ color: 'var(--accent-primary)' }}>{value.length}</strong> / {coreModules.length + ivrModules.length} Modules
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${isCoreOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={selectCoreOnly}
            style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.65rem' }}
          >
            Only Core (Manual Dialing)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isFullSuite ? 'btn-primary' : 'btn-secondary'}`}
            onClick={selectAllWithIvr}
            style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.65rem' }}
          >
            <Sparkles size={13} style={{ marginRight: '0.25rem' }} /> Full Suite (With IVR)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={clearAll}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* 1. Core Supervisor Modules (9) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={18} color="var(--accent-success)" />
          <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core Supervisor Modules ({coreModules.filter((m) => value.includes(m.code)).length}/{coreModules.length})
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            · Collections CRM, allocation, team management, reports & manual calling
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
          {coreModules.map((f) => {
            const checked = value.includes(f.code);
            return (
              <label
                key={f.code}
                onClick={() => toggle(f.code, f.dependsOn)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: checked ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                    marginTop: 2,
                  }}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{f.label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.code}</span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {f.hint}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. IVR Specific Modules (4) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Headphones size={18} color="var(--accent-primary)" />
          <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            IVR & Telephony Automation Modules ({ivrModules.filter((m) => value.includes(m.code)).length}/{ivrModules.length})
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            · Inbound routing, IVR agent skill groups & call recording storage
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
          {ivrModules.map((f) => {
            const checked = value.includes(f.code);
            return (
              <label
                key={f.code}
                onClick={() => toggle(f.code, f.dependsOn)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${checked ? 'rgba(99, 102, 241, 0.5)' : 'var(--border-color)'}`,
                  background: checked ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
                    marginTop: 2,
                  }}
                >
                  {checked && <Check size={12} strokeWidth={3} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{f.label}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.code}</span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {f.hint}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
