import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneForwarded,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Hash,
  Clock,
  Shield,
  Layers,
  Settings,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { toast } from '../../../components/shared/Toast';
import type { TelephonyTrunk } from '../types';

export default function TelephonyPage() {
  const trunks = useSuperAdminStore((s) => s.trunks);
  const updateTrunkStatus = useSuperAdminStore((s) => s.updateTrunkStatus);
  const companies = useSuperAdminStore((s) => s.companies);

  const [refreshing, setRefreshing] = useState(false);

  const totalActiveChannels = trunks.reduce((n, t) => n + t.channelsActive, 0);
  const totalMaxChannels = trunks.reduce((n, t) => n + t.channelsMax, 0);
  const totalDidAllocated = trunks.reduce((n, t) => n + t.didAllocated, 0);
  const totalDidCapacity = trunks.reduce((n, t) => n + t.didTotal, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Carrier telemetry refreshed');
    }, 600);
  };

  const toggleTrunkMaintenance = (trunk: TelephonyTrunk) => {
    const nextStatus = trunk.status === 'maintenance' ? 'operational' : 'maintenance';
    updateTrunkStatus(trunk.id, nextStatus);
    toast.info(`Trunk ${trunk.name} set to ${nextStatus}`);
  };

  return (
    <div className="sa-page animate-fade-in">
      <div className="page-header">
        <div>
          <div className="sa-badge-pill">
            <Radio size={14} /> Carrier Infrastructure
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <PhoneForwarded size={24} /> Telephony & SIP Trunk Governance
          </h1>
          <p className="page-subtitle">
            Carrier-grade SIP trunk telemetry, DID pool inventory, and multi-tenant voice gateways.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Polling...' : 'Refresh Trunks'}
        </button>
      </div>

      {/* Infrastructure Top Gauges */}
      <div className="sa-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box green">
              <Activity size={20} />
            </div>
            <span className="sa-stat-chip green">Live Carrier Load</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">
              {totalActiveChannels} <span className="sa-stat-meter-max">/ {totalMaxChannels}</span>
            </div>
            <div className="sa-stat-label">Active Concurrent Channels</div>
            <div className="sa-stat-sub">Across all active tenant dialers</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box indigo">
              <Hash size={20} />
            </div>
            <span className="sa-stat-chip indigo">DID Inventory</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">
              {totalDidAllocated} <span className="sa-stat-meter-max">/ {totalDidCapacity}</span>
            </div>
            <div className="sa-stat-label">DID Phone Numbers</div>
            <div className="sa-stat-sub">{totalDidCapacity - totalDidAllocated} Virtual DIDs in Pool</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box cyan">
              <Server size={20} />
            </div>
            <span className="sa-stat-chip cyan">Gateways</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">
              {trunks.filter((t) => t.status === 'operational').length} <span className="sa-stat-meter-max">/ {trunks.length}</span>
            </div>
            <div className="sa-stat-label">Operational SIP Trunks</div>
            <div className="sa-stat-sub">1 Degraded (Twilio APAC)</div>
          </div>
        </div>

        <div className="sa-metric-card">
          <div className="sa-metric-card-top">
            <div className="sa-stat-icon-box amber">
              <Zap size={20} />
            </div>
            <span className="sa-stat-chip amber">Mean Latency</span>
          </div>
          <div className="sa-metric-card-body">
            <div className="sa-stat-value">18 ms</div>
            <div className="sa-stat-label">Mean WebRTC Latency</div>
            <div className="sa-stat-sub">Tata Teleservices Primary</div>
          </div>
        </div>
      </div>

      {/* Carrier SIP Trunk Status Table */}
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header-row">
          <div>
            <h3 className="card-title">
              <Server size={18} /> Enterprise Carrier Gateways & Trunks
            </h3>
            <p className="sa-muted">
              Primary routing gateways for outgoing progressive dialing and incoming IVR queues.
            </p>
          </div>
        </div>

        <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
          <table>
            <thead>
              <tr>
                <th>Gateway / Trunk</th>
                <th>Carrier Provider</th>
                <th>Region</th>
                <th>Status</th>
                <th>Active Channels</th>
                <th>Latency</th>
                <th>DID Allocation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trunks.map((t) => {
                const channelPct = Math.round((t.channelsActive / t.channelsMax) * 100);
                const didPct = Math.round((t.didAllocated / t.didTotal) * 100);

                return (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <div className="sa-muted">Heartbeat: {t.lastHeartbeat}</div>
                    </td>

                    <td>
                      <span className="sa-plan-tag">{t.provider}</span>
                    </td>

                    <td>
                      <span className="sa-muted">{t.region}</span>
                    </td>

                    <td>
                      {t.status === 'operational' ? (
                        <span className="badge badge-success">● Operational</span>
                      ) : t.status === 'degraded' ? (
                        <span className="badge badge-warning">⚠️ High Latency</span>
                      ) : (
                        <span className="badge badge-danger">Maintenance</span>
                      )}
                    </td>

                    <td style={{ minWidth: '130px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        {t.channelsActive} / {t.channelsMax} ({channelPct}%)
                      </div>
                      <div className="sa-quota-track" style={{ marginTop: '4px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${channelPct}%`,
                            background: 'var(--accent-primary)',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: t.latencyMs > 50 ? '#f59e0b' : '#10b981' }}>
                        {t.latencyMs} ms
                      </strong>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem' }}>
                        {t.didAllocated} / {t.didTotal} ({didPct}%)
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`btn btn-xs ${
                          t.status === 'maintenance' ? 'btn-success-outline' : 'btn-secondary'
                        }`}
                        onClick={() => toggleTrunkMaintenance(t)}
                      >
                        {t.status === 'maintenance' ? 'Enable' : 'Maintenance'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DID Pool Distribution & Routing Policies */}
      <div className="sa-split" style={{ marginTop: '1.25rem' }}>
        {/* Tenant DID Allocations */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="card-title">
              <Hash size={18} /> Tenant DID Number Allocation
            </h3>
            <span className="sa-muted">Top Voice Tenants</span>
          </div>

          <div className="sa-list">
            {companies
              .filter((c) => c.features.includes('calling'))
              .map((c) => (
                <div key={c.id} className="sa-seat-load-row">
                  <div>
                    <Link to={`/superadmin/companies/${c.id}`} className="sa-table-link">
                      {c.name}
                    </Link>
                    <div className="sa-muted">
                      {c.code} · {c.quotas.concurrentAgents} Concurrent Channels
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-info">
                      {Math.max(2, Math.round(c.quotas.seats / 3))} Assigned DIDs
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Global Fallback & Recording Policies */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Settings size={18} /> Global Telephony Configuration
          </h3>

          <div className="sa-review">
            <p>
              <span>Default Outbound Trunk</span>
              <strong>Tata Teleservices Primary SIP</strong>
            </p>
            <p>
              <span>Failover Automatic Route</span>
              <strong>Airtel Enterprise Secondary</strong>
            </p>
            <p>
              <span>Dual-Channel Audio Recording</span>
              <strong>AES-256 Cloud Vault (Encrypted)</strong>
            </p>
            <p>
              <span>Call Recording Retention</span>
              <strong>365 Days (Regulatory Requirement)</strong>
            </p>
            <p>
              <span>Caller ID Spoof Protection</span>
              <strong>STIR/SHAKEN Level A (Active)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
