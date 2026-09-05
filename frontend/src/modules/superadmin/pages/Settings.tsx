import { useState } from 'react';
import {
  Settings,
  Shield,
  Clock,
  Mail,
  Lock,
  Globe,
  Bell,
  Save,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  Radio,
  Sliders,
  DollarSign,
  Layers,
  HardDrive,
  KeyRound,
  Download,
  Eye,
  EyeOff,
  LogOut,
  HelpCircle,
  Zap,
  Cpu,
  Database,
  FileCheck,
  Check,
  Send,
} from 'lucide-react';
import { useSuperAdminStore } from '../store';
import { DEFAULT_PLATFORM_SETTINGS, FEATURE_CATALOG } from '../data/catalog';
import { toast } from '../../../components/shared/Toast';
import type { PlatformSettings, FeatureCode } from '../types';

const SETTING_SECTIONS = [
  { id: 'all', label: 'All Settings' },
  { id: 'branding', label: '1. Identity & Branding', icon: Globe },
  { id: 'security', label: '2. Security & Access', icon: Shield },
  { id: 'billing', label: '3. Billing Defaults', icon: DollarSign },
  { id: 'trial', label: '4. Trial & Onboarding', icon: Clock },
  { id: 'telephony', label: '5. Telephony & SIP', icon: PhoneCall },
  { id: 'limits', label: '6. Quota Enforcement', icon: Sliders },
  { id: 'maintenance', label: '7. Maintenance Mode', icon: AlertTriangle },
  { id: 'integrations', label: '8. API & Integrations', icon: KeyRound },
  { id: 'notifications', label: '9. Alerts & Comms', icon: Bell },
  { id: 'audit', label: '10. Audit & Compliance', icon: FileCheck },
];

export default function SettingsPage() {
  const settings = useSuperAdminStore((s) => s.settings);
  const updateSettings = useSuperAdminStore((s) => s.updateSettings);

  const [form, setForm] = useState<PlatformSettings>({
    ...DEFAULT_PLATFORM_SETTINGS,
    ...settings,
  });

  const [activeSection, setActiveSection] = useState<string>('all');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState<string>('Today at 03:24 PM');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(form);
    const now = new Date();
    setLastSaved(`Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    toast.success('Platform governance & system configuration applied globally');
  };

  const handleReset = () => {
    if (window.confirm('Reset all platform settings to factory SaaS defaults?')) {
      setForm(DEFAULT_PLATFORM_SETTINGS);
      updateSettings(DEFAULT_PLATFORM_SETTINGS);
      toast.info('Settings reset to platform defaults');
    }
  };

  const toggleTrialFeature = (code: FeatureCode) => {
    const exists = form.defaultTrialFeatures.includes(code);
    const next = exists
      ? form.defaultTrialFeatures.filter((c) => c !== code)
      : [...form.defaultTrialFeatures, code];
    setForm({ ...form, defaultTrialFeatures: next });
  };

  const isVisible = (secId: string) => activeSection === 'all' || activeSection === secId;

  return (
    <div className="sa-page animate-fade-in">
      {/* Sticky Header Bar */}
      <div className="page-header" style={{ position: 'sticky', top: '68px', zIndex: 85, background: 'var(--bg-primary)', paddingTop: '0.5rem', paddingBottom: '0.75rem' }}>
        <div>
          <div className="sa-badge-pill">
            <Settings size={14} /> Global Control Plane Governance
          </div>
          <h1 className="page-title" style={{ marginTop: '0.35rem' }}>
            <Settings size={24} /> Platform & Governance Settings
          </h1>
          <p className="page-subtitle">
            Configure platform branding, security enforcement, default trial parameters & system behavior.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="sa-muted" style={{ fontSize: '0.78rem' }}>
            Last updated: <strong>{lastSaved}</strong>
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSave()}>
            <Save size={16} /> Save All Settings
          </button>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="sa-tabs-bar" style={{ marginBottom: '1.25rem' }}>
        {SETTING_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              type="button"
              className={`sa-tab-item ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => setActiveSection(sec.id)}
            >
              {Icon && <Icon size={14} />} {sec.label}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Form Grid */}
      <form onSubmit={handleSave}>
        <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.25rem' }}>
          {/* ═══════════════════════════════════════════
             1. Platform Identity & Branding
             ═══════════════════════════════════════════ */}
          {isVisible('branding') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <Globe size={18} className="sa-text-indigo" /> 1. Platform Identity & Branding
                </h3>
                <span className="sa-stat-chip indigo">Core Branding</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <label className="sa-field">
                  <span>Platform Name</span>
                  <input
                    className="form-input"
                    value={form.platformName}
                    onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  />
                </label>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Central Support Email</span>
                    <input
                      type="email"
                      className="form-input"
                      value={form.supportEmail}
                      onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Support Phone Hotline</span>
                    <input
                      className="form-input"
                      value={form.supportPhone}
                      onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                    />
                  </label>
                </div>

                {/* Upload Logo & Favicon Previews */}
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="sa-field">
                    <span>Platform Logo (Light/Dark)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div className="sa-company-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>BN</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>logo-vector.svg</div>
                        <div className="sa-muted" style={{ fontSize: '0.7rem' }}>SVG, PNG (Max 2MB)</div>
                      </div>
                      <button type="button" className="btn btn-xs btn-outline" onClick={() => toast.info('Logo upload triggered')}>Upload</button>
                    </div>
                  </div>

                  <div className="sa-field">
                    <span>Favicon (.ICO / .PNG)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#6366f1' }}>B</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>favicon.ico</div>
                        <div className="sa-muted" style={{ fontSize: '0.7rem' }}>32x32 px</div>
                      </div>
                      <button type="button" className="btn btn-xs btn-outline" onClick={() => toast.info('Favicon upload triggered')}>Upload</button>
                    </div>
                  </div>
                </div>

                {/* White label toggle */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Enable Custom Domain White-Labeling</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Allows Enterprise tenants to mask their CRM dashboard under CNAME domains.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.enableWhiteLabel}
                      onChange={(e) => setForm({ ...form, enableWhiteLabel: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             2. Security & Access Control
             ═══════════════════════════════════════════ */}
          {isVisible('security') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <Shield size={18} className="sa-text-indigo" /> 2. Security & Access Control
                </h3>
                <span className="sa-stat-chip amber">Compliance</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                {/* 2FA Toggle Banner */}
                <div style={{ padding: '0.75rem 1rem', background: form.require2FAForAdmins ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-tertiary)', borderRadius: '8px', border: form.require2FAForAdmins ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: form.require2FAForAdmins ? '#d97706' : 'inherit' }}>
                      Enforce 2FA for all Tenant Admins
                    </strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Mandates TOTP (Google Authenticator) upon login for company administrators.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.require2FAForAdmins}
                      onChange={(e) => setForm({ ...form, require2FAForAdmins: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Admin Session Inactivity Timeout</span>
                    <input
                      type="number"
                      min={15}
                      max={480}
                      className="form-input"
                      value={form.sessionTimeoutMinutes}
                      onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Max Login Attempts</span>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      className="form-input"
                      value={form.maxLoginAttempts}
                      onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}
                    />
                  </label>
                </div>

                {/* Password Policy */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Password Complexity Policy
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <input
                        type="number"
                        min={6}
                        max={32}
                        style={{ width: '60px', padding: '3px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        value={form.passwordMinLength}
                        onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) })}
                      />
                      Min Length
                    </label>

                    <label className="sa-checkbox-label">
                      <input
                        type="checkbox"
                        checked={form.requireSpecialChar}
                        onChange={(e) => setForm({ ...form, requireSpecialChar: e.target.checked })}
                      />
                      <span>Require Special Characters (@$!%*?)</span>
                    </label>
                  </div>
                </div>

                <label className="sa-field">
                  <span>Super Admin Allowed IP Ranges (CIDR Whitelist)</span>
                  <input
                    className="form-input"
                    value={form.allowedIpRanges}
                    onChange={(e) => setForm({ ...form, allowedIpRanges: e.target.value })}
                    placeholder="0.0.0.0/0 (Any IP)"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             3. Billing & Subscription Defaults
             ═══════════════════════════════════════════ */}
          {isVisible('billing') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <DollarSign size={18} className="sa-text-indigo" /> 3. Billing & Subscription Defaults
                </h3>
                <span className="sa-stat-chip green">Automated Invoicing</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Default Currency</span>
                    <select
                      className="form-input"
                      value={form.defaultCurrency}
                      onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value as any })}
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="AED">AED (AED - UAE Dirham)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                    </select>
                  </label>

                  <label className="sa-field">
                    <span>Invoice Number Prefix</span>
                    <input
                      className="form-input"
                      value={form.invoicePrefix}
                      onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                      placeholder="INV-BN-"
                    />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Default Grace Period Days</span>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      className="form-input"
                      value={form.defaultGraceDays}
                      onChange={(e) => setForm({ ...form, defaultGraceDays: Number(e.target.value) })}
                    />
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Auto-Renewal Policy
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', padding: '0 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Enable Auto-Renew</span>
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={form.enableAutoRenew}
                          onChange={(e) => setForm({ ...form, enableAutoRenew: e.target.checked })}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Auto-Lock Switch */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Auto-Lock Tenants on Grace Period Expiry</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Automatically suspends tenant login and disables progressive calling when validity expires.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.autoLockOnExpiry}
                      onChange={(e) => setForm({ ...form, autoLockOnExpiry: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             4. Trial & Onboarding Settings
             ═══════════════════════════════════════════ */}
          {isVisible('trial') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <Clock size={18} className="sa-text-indigo" /> 4. Trial & Onboarding Settings
                </h3>
                <span className="sa-stat-chip blue">Free Tier Presets</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Default Trial Duration (Days)</span>
                    <input
                      type="number"
                      min={7}
                      max={60}
                      className="form-input"
                      value={form.defaultTrialDays}
                      onChange={(e) => setForm({ ...form, defaultTrialDays: Number(e.target.value) })}
                    />
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Trial Activation
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', padding: '0 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Auto-Start on Signup</span>
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={form.trialAutoStartOnSignup}
                          onChange={(e) => setForm({ ...form, trialAutoStartOnSignup: e.target.checked })}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Default Trial Features Checklist */}
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Default Bundled Modules for Trial Accounts ({form.defaultTrialFeatures.length} Active)
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {FEATURE_CATALOG.slice(0, 6).map((feat) => {
                      const on = form.defaultTrialFeatures.includes(feat.code);
                      return (
                        <button
                          key={feat.code}
                          type="button"
                          className={`sa-chip ${on ? 'on' : ''}`}
                          style={{ justifyContent: 'flex-start', padding: '4px 8px' }}
                          onClick={() => toggleTrialFeature(feat.code)}
                        >
                          {on ? <Check size={12} /> : null} {feat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trial Limits */}
                <div className="sa-form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <label className="sa-field">
                    <span>Trial Seats</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.trialSeats}
                      onChange={(e) => setForm({ ...form, trialSeats: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Trial Minutes</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.trialMinutes}
                      onChange={(e) => setForm({ ...form, trialMinutes: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Trial Storage (GB)</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.trialStorageGb}
                      onChange={(e) => setForm({ ...form, trialStorageGb: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             5. Telephony Configuration
             ═══════════════════════════════════════════ */}
          {isVisible('telephony') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <PhoneCall size={18} className="sa-text-indigo" /> 5. Telephony Configuration
                </h3>
                <span className="sa-stat-chip cyan">Carrier Policy</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Global Audio Call Recording</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Enables continuous WebRTC & SIP call recording across telecallers.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.enableCallRecording}
                      onChange={(e) => setForm({ ...form, enableCallRecording: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Recording Retention (Days)</span>
                    <input
                      type="number"
                      min={15}
                      max={365}
                      className="form-input"
                      value={form.recordingRetentionDays}
                      onChange={(e) => setForm({ ...form, recordingRetentionDays: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Dial Timeout (Seconds)</span>
                    <input
                      type="number"
                      min={15}
                      max={90}
                      className="form-input"
                      value={form.defaultDialTimeoutSeconds}
                      onChange={(e) => setForm({ ...form, defaultDialTimeoutSeconds: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Max Concurrent Calls / Tenant</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.maxConcurrentCallsPerTenant}
                      onChange={(e) => setForm({ ...form, maxConcurrentCallsPerTenant: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>DID Allocation Strategy</span>
                    <select
                      className="form-input"
                      value={form.didAllocationStrategy}
                      onChange={(e) => setForm({ ...form, didAllocationStrategy: e.target.value as any })}
                    >
                      <option value="least_utilized">Least Utilized DID Pool</option>
                      <option value="round_robin">Round Robin Balancing</option>
                      <option value="sticky_tenant">Sticky Tenant Number Pool</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             6. Usage & Limits Enforcement
             ═══════════════════════════════════════════ */}
          {isVisible('limits') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <Sliders size={18} className="sa-text-indigo" /> 6. Usage & Limits Enforcement
                </h3>
                <span className="sa-stat-chip amber">Quota Guard</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div className="sa-field">
                  <span>Seat Limit Enforcement Policy</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <label
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: form.seatEnforcementPolicy === 'hard_block' ? '1px solid #6366f1' : '1px solid var(--border-color)',
                        background: form.seatEnforcementPolicy === 'hard_block' ? 'var(--accent-primary-glow)' : 'var(--bg-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="seatPolicy"
                        checked={form.seatEnforcementPolicy === 'hard_block'}
                        onChange={() => setForm({ ...form, seatEnforcementPolicy: 'hard_block' })}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>Hard Block</strong>
                        <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.72rem' }}>
                          Rejects new user logins or agent additions when seat quota is exceeded.
                        </p>
                      </div>
                    </label>

                    <label
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: form.seatEnforcementPolicy === 'soft_warning' ? '1px solid #6366f1' : '1px solid var(--border-color)',
                        background: form.seatEnforcementPolicy === 'soft_warning' ? 'var(--accent-primary-glow)' : 'var(--bg-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="seatPolicy"
                        checked={form.seatEnforcementPolicy === 'soft_warning'}
                        onChange={() => setForm({ ...form, seatEnforcementPolicy: 'soft_warning' })}
                        style={{ marginTop: '2px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.82rem' }}>Soft Warning</strong>
                        <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.72rem' }}>
                          Allows temporary overage with alert notification sent to Super Admin.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Usage Alert Threshold (%)</span>
                    <input
                      type="number"
                      min={50}
                      max={95}
                      className="form-input"
                      value={form.usageAlertThresholdPct}
                      onChange={(e) => setForm({ ...form, usageAlertThresholdPct: Number(e.target.value) })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Default Storage Limit (GB)</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.defaultStorageGb}
                      onChange={(e) => setForm({ ...form, defaultStorageGb: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             7. Scheduled Maintenance Mode
             ═══════════════════════════════════════════ */}
          {isVisible('maintenance') && (
            <div className="card" style={{ borderLeft: form.maintenanceMode ? '4px solid #ef4444' : undefined }}>
              <div className="card-header-row">
                <h3 className="card-title">
                  <AlertTriangle size={18} className={form.maintenanceMode ? 'sa-text-danger' : 'sa-text-warning'} /> 7. Scheduled Maintenance Mode
                </h3>
                <span className={`sa-stat-chip ${form.maintenanceMode ? 'red' : 'gray'}`}>
                  {form.maintenanceMode ? 'ACTIVE MAINTENANCE' : 'Standby'}
                </span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', background: form.maintenanceMode ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-tertiary)', borderRadius: '8px', border: form.maintenanceMode ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: form.maintenanceMode ? '#ef4444' : 'inherit' }}>
                      Enable Platform-Wide Maintenance Mode
                    </strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Displays maintenance splash screen and pauses progressive calling queues.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.maintenanceMode}
                      onChange={(e) => setForm({ ...form, maintenanceMode: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Window Start (Date & Time)</span>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.maintenanceStartTime}
                      onChange={(e) => setForm({ ...form, maintenanceStartTime: e.target.value })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Window End (Date & Time)</span>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={form.maintenanceEndTime}
                      onChange={(e) => setForm({ ...form, maintenanceEndTime: e.target.value })}
                    />
                  </label>
                </div>

                <label className="sa-field">
                  <span>Public Maintenance Notice (Broadcasted to Tenants)</span>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={form.maintenanceNotice}
                    onChange={(e) => setForm({ ...form, maintenanceNotice: e.target.value })}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-xs btn-danger-outline"
                    onClick={() => {
                      if (window.confirm('Force terminate all active tenant user sessions?')) {
                        toast.warning('All tenant admin and telecaller sessions terminated.');
                      }
                    }}
                  >
                    <LogOut size={13} /> Force Logout All Tenant Users
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             8. Integrations & API Keys
             ═══════════════════════════════════════════ */}
          {isVisible('integrations') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <KeyRound size={18} className="sa-text-indigo" /> 8. Integrations & API Keys
                </h3>
                <span className="sa-stat-chip indigo">Gateways & Webhooks</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                {/* Razorpay */}
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Razorpay Key ID</span>
                    <input
                      className="form-input"
                      value={form.razorpayKeyId}
                      onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>Razorpay Secret Key</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSecrets['razorpay'] ? 'text' : 'password'}
                        className="form-input"
                        value={form.razorpayKeySecret}
                        onChange={(e) => setForm({ ...form, razorpayKeySecret: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('razorpay')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showSecrets['razorpay'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </label>
                </div>

                {/* SMS & WhatsApp */}
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>SMS Gateway API Key / DLT Sender ID</span>
                    <input
                      className="form-input"
                      value={form.smsSenderId}
                      onChange={(e) => setForm({ ...form, smsSenderId: e.target.value })}
                      placeholder="BNORBT"
                    />
                  </label>

                  <label className="sa-field">
                    <span>WhatsApp Cloud API Token</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showSecrets['whatsapp'] ? 'text' : 'password'}
                        className="form-input"
                        value={form.whatsappApiToken}
                        onChange={(e) => setForm({ ...form, whatsappApiToken: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('whatsapp')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showSecrets['whatsapp'] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </label>
                </div>

                {/* SMTP Host & Port */}
                <div className="sa-form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>SMTP Relay Host</span>
                    <input
                      className="form-input"
                      value={form.smtpHost}
                      onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                    />
                  </label>

                  <label className="sa-field">
                    <span>SMTP Port</span>
                    <input
                      type="number"
                      className="form-input"
                      value={form.smtpPort}
                      onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                    />
                  </label>
                </div>

                <label className="sa-field">
                  <span>Global Webhook Dispatcher URL</span>
                  <input
                    className="form-input"
                    value={form.webhookUrl}
                    onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                    placeholder="https://your-domain.com/webhooks"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             9. Notifications & Alerts
             ═══════════════════════════════════════════ */}
          {isVisible('notifications') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <Bell size={18} className="sa-text-indigo" /> 9. Notifications & Alerts
                </h3>
                <span className="sa-stat-chip cyan">Automated Dispatch</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Subscription Expiry Reminders (7d, 3d, 1d)</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Sends automated email and in-app renewal reminders to tenant billing admins.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.sendExpiryReminders}
                      onChange={(e) => setForm({ ...form, sendExpiryReminders: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Quota Overload & 80%+ Warnings</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Alerts company owners when voice minutes or seat licenses exceed 80%.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.sendUsageAlerts}
                      onChange={(e) => setForm({ ...form, sendUsageAlerts: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>

                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-checkbox-label" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <input
                      type="checkbox"
                      checked={form.notifyAdminsEmail}
                      onChange={(e) => setForm({ ...form, notifyAdminsEmail: e.target.checked })}
                    />
                    <span>Email Super Admin on Critical Alerts</span>
                  </label>

                  <label className="sa-checkbox-label" style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <input
                      type="checkbox"
                      checked={form.notifyAdminsSlack}
                      onChange={(e) => setForm({ ...form, notifyAdminsSlack: e.target.checked })}
                    />
                    <span>Forward Events to Slack Webhook</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
             10. Audit & Compliance
             ═══════════════════════════════════════════ */}
          {isVisible('audit') && (
            <div className="card">
              <div className="card-header-row">
                <h3 className="card-title">
                  <FileCheck size={18} className="sa-text-indigo" /> 10. Audit & Compliance
                </h3>
                <span className="sa-stat-chip green">Regulatory Ready</span>
              </div>

              <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div className="sa-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label className="sa-field">
                    <span>Audit Log Retention Period (Days)</span>
                    <input
                      type="number"
                      min={90}
                      max={730}
                      className="form-input"
                      value={form.logRetentionDays}
                      onChange={(e) => setForm({ ...form, logRetentionDays: Number(e.target.value) })}
                    />
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Immutable Auditing
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '40px', padding: '0 0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active Activity Trail</span>
                      <label className="sa-switch">
                        <input
                          type="checkbox"
                          checked={form.enableActivityTracking}
                          onChange={(e) => setForm({ ...form, enableActivityTracking: e.target.checked })}
                        />
                        <span className="sa-slider" />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>Data Retention & Privacy Act Compliance</strong>
                    <p className="sa-muted" style={{ margin: '2px 0 0', fontSize: '0.74rem' }}>
                      Enforces anonymization of debtor records and encrypted call audio purging after retention expiry.
                    </p>
                  </div>
                  <label className="sa-switch">
                    <input
                      type="checkbox"
                      checked={form.dataRetentionPolicyCompliant}
                      onChange={(e) => setForm({ ...form, dataRetentionPolicyCompliant: e.target.checked })}
                    />
                    <span className="sa-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
