import { useState } from 'react';
import {
  Sliders,
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
  CheckCircle2,
  AlertCircle,
  Info,
  Building2,
  Users,
  Search,
} from 'lucide-react';
import { FEATURE_CATALOG } from '../data/catalog';
import { useSuperAdminStore } from '../store';
import type { FeatureCode } from '../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Database: <Database size={20} />,
  Layers: <Layers size={20} />,
  CalendarCheck: <CalendarCheck size={20} />,
  BarChart3: <BarChart3 size={20} />,
  PhoneCall: <PhoneCall size={20} />,
  Network: <Network size={20} />,
  Mic: <Mic size={20} />,
  MapPin: <MapPin size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Sparkles: <Sparkles size={20} />,
};

export default function FeaturesPage() {
  const companies = useSuperAdminStore((s) => s.companies);
  const [q, setQ] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const totalTenants = companies.length || 1;

  // Calculate adoption stats per feature
  const featureStats = FEATURE_CATALOG.map((f) => {
    const activeCompanies = companies.filter((c) => c.features.includes(f.code));
    const adoptionPct = Math.round((activeCompanies.length / totalTenants) * 100);
    return {
      ...f,
      activeCount: activeCompanies.length,
      adoptionPct,
      companies: activeCompanies,
    };
  });

  const filteredFeatures = featureStats.filter((f) => {
    const matchGroup = selectedGroup === 'all' || f.group === selectedGroup;
    const matchQuery =
      !q.trim() ||
      `${f.label} ${f.hint} ${f.code}`.toLowerCase().includes(q.toLowerCase());
    return matchGroup && matchQuery;
  });

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <Sliders size={14} /> Modular Architecture
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <Sliders size={24} /> Platform Features & Module Governance
          </h1>
          <p className="page-subtitle">
            Configure system modules, enforce dependency trees, and inspect tenant adoption rates across BNORBIT.
          </p>
        </div>
      </div>

      {/* Feature Adoption KPI Summary */}
      <div className="sa-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="stat-card">
          <div className="sa-metric-card-top">
            <div className="stat-icon indigo">
              <Sliders size={20} />
            </div>
            <span className="sa-stat-chip">10 Available</span>
          </div>
          <div className="stat-content" style={{ marginTop: '0.5rem' }}>
            <h3 className="sa-stat-value">{FEATURE_CATALOG.length}</h3>
            <p className="sa-stat-label">Total Modules</p>
            <span className="stat-change">4 Module Categories</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <PhoneCall size={20} />
          </div>
          <div className="stat-content">
            <h3 className="sa-stat-value">
              {featureStats.find((f) => f.code === 'calling')?.adoptionPct}%
            </h3>
            <p className="sa-stat-label">Progressive Voice Adoption</p>
            <span className="stat-change">
              {featureStats.find((f) => f.code === 'calling')?.activeCount} Active Tenants
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <MessageSquare size={20} />
          </div>
          <div className="stat-content">
            <h3 className="sa-stat-value">
              {featureStats.find((f) => f.code === 'whatsapp')?.adoptionPct}%
            </h3>
            <p className="sa-stat-label">WhatsApp Omnichannel</p>
            <span className="stat-change">Verified Meta BSP API</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Sparkles size={20} />
          </div>
          <div className="stat-content">
            <h3 className="sa-stat-value">
              {featureStats.find((f) => f.code === 'ai_analytics')?.adoptionPct}%
            </h3>
            <p className="sa-stat-label">AI Call QA & Sentiment</p>
            <span className="stat-change">Enterprise Tier Feature</span>
          </div>
        </div>
      </div>

      {/* Dependency Logic Architecture Banner */}
      <div className="card" style={{ marginTop: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Network size={20} className="sa-text-indigo" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            Module Dependency & Enforcement Matrix
          </h3>
        </div>
        <p className="sa-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          BNORBIT automatically enforces module hierarchy to prevent orphaned data. When a feature is disabled for a tenant, all descendant modules are gracefully deactivated.
        </p>

        <div className="sa-dependency-flow">
          <div className="sa-dep-node core">
            <strong>Core CRM</strong>
            <small>Accounts & Debtor DB</small>
          </div>
          <span className="sa-dep-arrow">→</span>
          <div className="sa-dep-node">
            <strong>Progressive Dialer</strong>
            <small>Requires Core CRM</small>
          </div>
          <span className="sa-dep-arrow">→</span>
          <div className="sa-dep-node child">
            <strong>Inbound IVR & ACD</strong>
            <small>Requires Voice Dialer</small>
          </div>
          <span className="sa-dep-arrow">+</span>
          <div className="sa-dep-node child">
            <strong>Call Recordings</strong>
            <small>Requires Voice Dialer</small>
          </div>
          <span className="sa-dep-arrow">→</span>
          <div className="sa-dep-node intelligence">
            <strong>AI Speech QA</strong>
            <small>Requires Recordings</small>
          </div>
        </div>
      </div>

      {/* Feature Catalog Filter & List */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header-row" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="sa-filters">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'core', label: 'Core CRM' },
              { id: 'calling', label: 'Voice & Telephony' },
              { id: 'intelligence', label: 'Omnichannel & AI' },
              { id: 'field', label: 'Field Operations' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                className={`sa-chip ${selectedGroup === g.id ? 'on' : ''}`}
                onClick={() => setSelectedGroup(g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="form-input-icon" style={{ width: '260px' }}>
            <Search className="icon" size={15} />
            <input
              className="form-input"
              placeholder="Search module name or code..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="sa-feature-catalog-grid" style={{ marginTop: '1rem' }}>
          {filteredFeatures.map((f) => {
            const depLabels = f.dependsOn
              .map((d) => FEATURE_CATALOG.find((c) => c.code === d)?.label || d)
              .join(', ');

            return (
              <div key={f.code} className="sa-feature-card">
                <div className="sa-feature-card-header">
                  <div className="sa-feature-card-icon">
                    {ICON_MAP[f.iconName || 'Layers']}
                  </div>
                  <div>
                    <h4 className="sa-feature-card-title">{f.label}</h4>
                    <span className="sa-code-badge">{f.code}</span>
                  </div>
                </div>

                <p className="sa-feature-card-hint">{f.hint}</p>

                {/* Dependencies */}
                {f.dependsOn.length > 0 ? (
                  <div className="sa-feature-dep-pill">
                    <Info size={12} />
                    <span>Requires: {depLabels}</span>
                  </div>
                ) : (
                  <div className="sa-feature-dep-pill independent">
                    <CheckCircle2 size={12} />
                    <span>Independent Base Module</span>
                  </div>
                )}

                {/* Adoption Meter */}
                <div className="sa-feature-adoption-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tenant Adoption</span>
                    <strong>{f.activeCount} / {totalTenants} Tenants ({f.adoptionPct}%)</strong>
                  </div>
                  <div className="sa-quota-track">
                    <div
                      style={{
                        height: '100%',
                        width: `${f.adoptionPct}%`,
                        background: 'var(--accent-primary)',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
