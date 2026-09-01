import React, { useState } from 'react';
import {
  Database,
  Layers,
  CalendarCheck,
  BarChart3,
  PhoneCall,
  Network,
  Mic,
  MapPin,
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle2,
  Upload,
  Wallet,
  AlertTriangle,
  Activity,
  History,
  Send,
  Star,
  Users,
  Award,
  ClipboardList,
  GraduationCap,
  FileSpreadsheet,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import type { FeatureCode, FeatureDef } from '../types';
import { FEATURE_CATALOG } from '../data/catalog';

interface FeatureChecklistProps {
  value: FeatureCode[];
  onChange: (next: FeatureCode[]) => void;
  showAllDependencies?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Database: <Database size={17} />,
  Layers: <Layers size={17} />,
  CalendarCheck: <CalendarCheck size={17} />,
  BarChart3: <BarChart3 size={17} />,
  PhoneCall: <PhoneCall size={17} />,
  Network: <Network size={17} />,
  Mic: <Mic size={17} />,
  MapPin: <MapPin size={17} />,
  MessageSquare: <MessageSquare size={17} />,
  Sparkles: <Sparkles size={17} />,
  Upload: <Upload size={17} />,
  Wallet: <Wallet size={17} />,
  AlertTriangle: <AlertTriangle size={17} />,
  Activity: <Activity size={17} />,
  History: <History size={17} />,
  Send: <Send size={17} />,
  Star: <Star size={17} />,
  Users: <Users size={17} />,
  Award: <Award size={17} />,
  ClipboardList: <ClipboardList size={17} />,
  GraduationCap: <GraduationCap size={17} />,
  FileSpreadsheet: <FileSpreadsheet size={17} />,
};

export default function FeatureChecklist({
  value,
  onChange,
}: FeatureChecklistProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const groups: { id: FeatureDef['group']; title: string; subtitle: string }[] = [
    {
      id: 'core',
      title: '1. Core CRM & Recovery Data Operations',
      subtitle: 'Debtor profiles, bucket allocations, bulk upload, PTP & payments',
    },
    {
      id: 'calling',
      title: '2. Telephony, Voice Dialer & Live Floor',
      subtitle: 'WebRTC softphone, inbound IVR, call recordings & floor monitoring',
    },
    {
      id: 'reports',
      title: '3. Supervisor Reporting & Analytics',
      subtitle: 'OneView, CC reports, field telemetry, digital engagement & QA score',
    },
    {
      id: 'team',
      title: '4. Team Management & Floor Operations',
      subtitle: 'Agent groups, commission incentives, EOD sign-offs & training guides',
    },
    {
      id: 'intelligence',
      title: '5. Omnichannel, Field & AI Intelligence',
      subtitle: 'WhatsApp API, SMS DLT broadcast, GPS mobile app & speech analytics',
    },
  ];

  const toggle = (code: FeatureCode, dependsOn: FeatureCode[]) => {
    const isCurrentlyOn = value.includes(code);
    if (isCurrentlyOn) {
      // If turning off, also turn off any feature that depends on this one
      const toRemove = new Set<FeatureCode>([code]);
      let changed = true;
      while (changed) {
        changed = false;
        FEATURE_CATALOG.forEach((f) => {
          if (!toRemove.has(f.code) && f.dependsOn.some((d) => toRemove.has(d))) {
            toRemove.add(f.code);
            changed = true;
          }
        });
      }
      onChange(value.filter((c) => !toRemove.has(c)));
      return;
    }

    // If turning on, auto-enable all dependencies
    const toAdd = new Set<FeatureCode>([code]);
    const collectDeps = (deps: FeatureCode[]) => {
      deps.forEach((d) => {
        toAdd.add(d);
        const def = FEATURE_CATALOG.find((f) => f.code === d);
        if (def && def.dependsOn.length > 0) {
          collectDeps(def.dependsOn);
        }
      });
    };
    collectDeps(dependsOn);

    const merged = Array.from(new Set([...value, ...Array.from(toAdd)]));
    onChange(merged);
  };

  const toggleGroup = (groupId: FeatureDef['group']) => {
    const groupFeatures = FEATURE_CATALOG.filter((f) => f.group === groupId);
    const allOn = groupFeatures.every((f) => value.includes(f.code));

    if (allOn) {
      // Turn all in group off
      const codes = new Set(groupFeatures.map((f) => f.code));
      onChange(value.filter((c) => !codes.has(c)));
    } else {
      // Turn all in group on (and their dependencies)
      const toAdd = new Set<FeatureCode>(value);
      groupFeatures.forEach((f) => {
        toAdd.add(f.code);
        f.dependsOn.forEach((d) => toAdd.add(d));
      });
      onChange(Array.from(toAdd));
    }
  };

  const filteredFeatures = FEATURE_CATALOG.filter((f) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      f.label.toLowerCase().includes(q) ||
      f.hint.toLowerCase().includes(q) ||
      (f.targetPage && f.targetPage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sa-feature-container">
      {/* Search & Quick Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="sa-search-input-field" style={{ maxWidth: '380px', flex: 1 }}>
          <Search className="icon" size={15} />
          <input
            type="text"
            placeholder="Search feature or supervisor route (e.g. IVR, Recordings, PTP)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={() => onChange(FEATURE_CATALOG.map((f) => f.code))}
          >
            Enable All ({FEATURE_CATALOG.length})
          </button>
          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={() => onChange(['crm', 'allocation', 'reports', 'calling', 'recordings', 'monitoring'])}
          >
            Recommended Suite (6)
          </button>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() => onChange(['crm'])}
          >
            Minimal Core Only
          </button>
        </div>
      </div>

      <div className="sa-feature-groups-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {groups.map((group) => {
          const groupFeatures = filteredFeatures.filter((f) => f.group === group.id);
          if (groupFeatures.length === 0) return null;

          const totalInGroup = FEATURE_CATALOG.filter((f) => f.group === group.id).length;
          const activeCount = FEATURE_CATALOG.filter((f) => f.group === group.id && value.includes(f.code)).length;
          const isAllGroupOn = activeCount === totalInGroup;

          return (
            <div key={group.id} className="sa-feature-group-card" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div
                className="sa-feature-group-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  background: 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <h4 className="sa-feature-group-title" style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                    {group.title}
                  </h4>
                  <p className="sa-feature-group-sub" style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {group.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`sa-stat-chip ${activeCount > 0 ? (isAllGroupOn ? 'green' : 'indigo') : 'gray'}`}>
                    {activeCount}/{totalInGroup} Enabled
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs btn-secondary"
                    onClick={() => toggleGroup(group.id)}
                  >
                    {isAllGroupOn ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div
                className="sa-feature-items-list"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: 'var(--bg-card)',
                }}
              >
                {groupFeatures.map((f) => {
                  const isChecked = value.includes(f.code);
                  const missingDeps = f.dependsOn.filter((d) => !value.includes(d));
                  const depLabels = f.dependsOn
                    .map((d) => FEATURE_CATALOG.find((c) => c.code === d)?.label || d)
                    .join(', ');

                  return (
                    <div
                      key={f.code}
                      className={`sa-feature-item-row ${isChecked ? 'selected' : ''}`}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '10px',
                        border: isChecked ? '1px solid #6366f1' : '1px solid var(--border-color)',
                        background: isChecked ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => toggle(f.code, f.dependsOn)}
                    >
                      <div
                        className="sa-stat-icon-box"
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                          color: isChecked ? '#6366f1' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {ICON_MAP[f.iconName || 'Layers'] || <Layers size={17} />}
                      </div>

                      <div className="sa-feature-details" style={{ flex: 1, minWidth: 0 }}>
                        <div className="sa-feature-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="sa-feature-label" style={{ fontWeight: 700, fontSize: '0.84rem' }}>
                            {f.label}
                          </span>
                          {f.isPopular && <span className="sa-popular-tag">Popular</span>}
                        </div>

                        <p className="sa-feature-hint" style={{ margin: '2px 0 4px', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {f.hint}
                        </p>

                        {/* Target Supervisor Route Tag */}
                        {f.targetPage && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', marginTop: '2px' }}>
                            <ExternalLink size={10} /> Panel Route: <code>{f.targetPage}</code>
                          </div>
                        )}

                        {f.dependsOn.length > 0 && (
                          <div className="sa-feature-dependency-tag" style={{ marginTop: '4px', fontSize: '0.7rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Info size={11} />
                            <span>
                              Requires: <strong>{depLabels}</strong>
                              {!isChecked && missingDeps.length > 0 && ' (auto-enabled)'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="sa-toggle-switch-wrapper" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, paddingTop: '2px' }}>
                        <label className="sa-switch">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(f.code, f.dependsOn)}
                          />
                          <span className="sa-slider" />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div
        className="card"
        style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={18} className="sa-text-success" />
          <span>
            <strong>{value.length} of {FEATURE_CATALOG.length}</strong> modules & pages will be active in the Supervisor & Telecaller portal for this company.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {value.slice(0, 5).map((code) => (
            <span key={code} className="sa-stat-chip green" style={{ fontSize: '0.72rem' }}>
              ✓ {code.toUpperCase()}
            </span>
          ))}
          {value.length > 5 && (
            <span className="sa-stat-chip indigo" style={{ fontSize: '0.72rem' }}>
              +{value.length - 5} More
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
