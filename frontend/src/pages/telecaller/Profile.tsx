import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import {
  Camera,
  Mail,
  Phone,
  Hash,
  Shield,
  KeyRound,
  Check,
  Trash2,
  Key,
  RotateCw,
  Copy,
  CheckCircle2,
  Clock,
  Building2,
  AlertCircle,
  AlertTriangle,
  Ban,
  Sparkles,
  Hourglass,
  X,
} from 'lucide-react';
import { toast } from '../../components/shared/Toast';
import { useSuperAdminStore } from '../../modules/superadmin/store';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPassword, setIsRequestingPassword] = useState(false);

  // SuperAdmin store integration for subscription & activation key
  const companies = useSuperAdminStore((s) => s.companies);
  const requestRenewal = useSuperAdminStore((s) => s.requestRenewal);
  const activateCompanyKey = useSuperAdminStore((s) => s.activateCompanyKey);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isRequestingRenewal, setIsRequestingRenewal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Live timer & popup modal states
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [dismissedKey, setDismissedKey] = useState<string>('');

  // 1-second interval timer for real-time countdown in last 24 hours
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Identify tenant company for current supervisor
  const company = useMemo(() => {
    if (!companies || companies.length === 0) return null;
    if (selectedCompanyId) {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (found) return found;
    }
    const userEmail = user?.email?.toLowerCase().trim() || '';
    let matched = companies.find(
      (c) =>
        c.loginEmail?.toLowerCase() === userEmail ||
        c.contactEmail?.toLowerCase() === userEmail
    );
    if (matched) return matched;

    const storedCompId = localStorage.getItem('bnorbit_current_company_id');
    if (storedCompId) {
      matched = companies.find((c) => c.id === storedCompId);
      if (matched) return matched;
    }

    return companies[0] || null;
  }, [companies, selectedCompanyId, user?.email]);

  // Compute expiry timestamp
  const expiryTimestamp = useMemo(() => {
    if (!company?.endDate) return Date.now() + 30 * 86400000;
    const endStr = company.endDate;
    if (endStr.includes('T')) {
      return new Date(endStr).getTime();
    }
    return new Date(`${endStr}T23:59:59`).getTime();
  }, [company?.endDate]);

  const diffMs = expiryTimestamp - currentTime;
  const isExpired = diffMs <= 0;
  const isLast24Hours = diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isLastDay = !isExpired && (diffDays <= 1 || isLast24Hours);
  const isLast5Days = !isExpired && diffDays <= 5 && !isLastDay;
  const isRenewalPending = Boolean(company?.renewalRequested);
  const isStopped = company?.status === 'suspended' || company?.activationKeyStatus === 'deactivated';
  const userCount = company?.quotas?.telecallers || company?.quotas?.seats || 10;

  // Format hours, minutes, seconds for live countdown
  const countdownFormatted = useMemo(() => {
    if (diffMs <= 0) return '00h 00m 00s';
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }, [diffMs]);

  // Trigger popup when in ending period (last 5 days, last day, last 24h, or expired)
  useEffect(() => {
    if (!company) return;
    const modalKey = `${company.id}_${Math.floor(expiryTimestamp / 3600000)}`;
    if (modalKey === dismissedKey) return;
    const sessionDismissed = sessionStorage.getItem(`dismissed_expiry_${company.id}`);

    if ((isLast5Days || isLastDay || isLast24Hours || isExpired) && !sessionDismissed) {
      setShowExpiryModal(true);
    }
  }, [company?.id, expiryTimestamp, isLast5Days, isLastDay, isLast24Hours, isExpired, dismissedKey]);

  const handleDismissModal = () => {
    setShowExpiryModal(false);
    if (company) {
      setDismissedKey(`${company.id}_${Math.floor(expiryTimestamp / 3600000)}`);
      sessionStorage.setItem(`dismissed_expiry_${company.id}`, 'true');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic('');
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (user) {
        updateUser({ ...user, phone, profilePic });
      }
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 600);
  };

  const handlePasswordRequest = () => {
    setIsRequestingPassword(true);
    setTimeout(() => {
      setIsRequestingPassword(false);
      toast.success('Password change request sent to Admin');
    }, 800);
  };

  const handleCopyKey = () => {
    if (!company?.activationKey) return;
    navigator.clipboard.writeText(company.activationKey);
    setCopiedKey(true);
    toast.success('Activation key copied to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRequestRenewal = () => {
    if (!company) return;
    setIsRequestingRenewal(true);
    setTimeout(() => {
      requestRenewal(company.id);
      setIsRequestingRenewal(false);
      toast.success('Renewal request sent to Super Admin!');
    }, 500);
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const cleanKey = newKeyInput.trim();
    if (!cleanKey) {
      toast.error('Please enter the 16-digit activation key');
      return;
    }
    setIsActivating(true);
    setTimeout(() => {
      const res = activateCompanyKey(company.id, cleanKey);
      setIsActivating(false);
      if (res.success) {
        toast.success(res.message);
        setNewKeyInput('');
        setShowExpiryModal(false);
      } else {
        toast.error(res.message);
      }
    }, 600);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Update your personal details, subscription validity, and security settings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Header / Avatar Card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))', position: 'relative' }}></div>
          <div style={{ padding: '0 2rem 2rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-50px' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', 
                border: '4px solid var(--bg-card)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                style={{
                  position: 'absolute', bottom: '0', right: '-8px', width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent-primary)', color: 'white', border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px var(--accent-primary-glow)', zIndex: 2
                }}
              >
                <Camera size={14} />
              </button>
              {profilePic && (
                <button 
                  onClick={handleRemovePhoto}
                  title="Remove photo"
                  style={{
                    position: 'absolute', bottom: '0', left: '-8px', width: '32px', height: '32px', borderRadius: '50%',
                    background: '#ef4444', color: 'white', border: '2px solid var(--bg-card)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', zIndex: 2
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Shield size={14} />
              <span style={{ textTransform: 'capitalize' }}>{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Personal Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Employee ID</label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={user?.employeeId || 'EMP-123'} disabled style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'not-allowed', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={user?.email} disabled style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'not-allowed', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: '600', fontSize: '0.875rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.8 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px var(--accent-primary-glow)' }}
            >
              {isSaving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Subscription & Activation Key Section */}
        {company && (
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '1rem',
              border: isLast24Hours || isExpired
                ? '1.5px solid rgba(239, 68, 68, 0.5)'
                : isLast5Days || isRenewalPending
                ? '1.5px solid rgba(245, 158, 11, 0.45)'
                : '1px solid var(--border-color)',
              padding: '2rem',
              boxShadow: isLast24Hours
                ? '0 4px 24px rgba(239, 68, 68, 0.12)'
                : isRenewalPending
                ? '0 4px 20px rgba(245, 158, 11, 0.08)'
                : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {/* Header with Company details */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={20} color="var(--accent-primary)" />
                  <span>Subscription & Activation Key</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  Tenant: <strong style={{ color: 'var(--text-primary)' }}>{company.name}</strong> ({company.code}) · {userCount} Seats
                </p>
              </div>

              {/* Company Switcher if multiple exist */}
              {companies.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}>
                  <Building2 size={14} color="var(--text-muted)" />
                  <select
                    value={company.id}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                    }}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.8125rem',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Deactivated or Stopped Alert */}
            {isStopped && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginBottom: '1.5rem',
                  color: '#ef4444',
                }}
              >
                <Ban size={18} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Account Suspended & Key Deactivated:</strong> Tenant operation is stopped by Super Admin.
                  Contact your administrator or enter a new activation key below to restore access.
                </div>
              </div>
            )}

            {/* Expiry Warning Banner (Visible if ending soon) */}
            {(isLast5Days || isLastDay || isLast24Hours || isExpired) && (
              <div
                style={{
                  background: isLast24Hours || isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: isLast24Hours || isExpired ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isLast24Hours ? (
                    <Hourglass size={20} color="#ef4444" className="animate-pulse" />
                  ) : (
                    <AlertTriangle size={20} color={isExpired ? '#ef4444' : '#f59e0b'} />
                  )}
                  <div>
                    <strong style={{ color: isLast24Hours || isExpired ? '#ef4444' : '#d97706', fontSize: '0.875rem' }}>
                      {isExpired
                        ? 'Subscription Expired!'
                        : isLast24Hours
                        ? `Urgent: Subscription Expiring Today (${countdownFormatted})`
                        : `Subscription Expiring in ${diffDays} Days`}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Click below to review the expiry alert or renew your subscription.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExpiryModal(true)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid currentColor',
                    background: 'transparent',
                    color: isLast24Hours || isExpired ? '#ef4444' : '#d97706',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View Expiry Alert
                </button>
              </div>
            )}

            {/* Renewal Pending Alert */}
            {isRenewalPending && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1.5px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '8px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong style={{ color: '#d97706' }}>Renewal Request Pending Super Admin Approval</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem', fontSize: '0.78rem' }}>
                    Request was submitted {company.renewalRequestedAt ? `on ${new Date(company.renewalRequestedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'recently'}.
                    Once you receive the new 16-digit activation key, enter it below to immediately update your validity.
                  </div>
                </div>
              </div>
            )}

            {/* Key & Validity Details Box */}
            <div
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-subtle)',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {/* Activation Key Column */}
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  16-Digit Activation Key
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: isStopped ? '#ef4444' : 'var(--accent-primary)',
                      textDecoration: isStopped ? 'line-through' : 'none',
                      background: 'var(--bg-card)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {company.activationKey || 'BN10-ORBX-2609-P4Q8'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: copiedKey ? 'var(--accent-success)' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                    title="Copy activation key"
                  >
                    {copiedKey ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isStopped ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      DEACTIVATED
                    </span>
                  ) : isExpired ? (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      EXPIRED
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      ● ACTIVE LICENSE
                    </span>
                  )}
                </div>
              </div>

              {/* Validity Column (Dynamic Color Rules: Green >5d, Orange <=5d, Red <=1d / 24h) */}
              <div>
                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Subscription Validity Till
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color={isLast24Hours || isExpired ? '#ef4444' : isLast5Days ? '#f59e0b' : 'var(--accent-primary)'} />
                    <span>{company.endDate || '2026-10-01'}</span>
                  </strong>

                  {/* Validity Badge with requested color logic */}
                  {isStopped ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      ● Deactivated
                    </span>
                  ) : isExpired ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      ● Expired {Math.abs(diffDays)}d ago
                    </span>
                  ) : isLast24Hours ? (
                    /* LAST 24 HOURS: RED with real-time countdown in hours/min/sec */
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1.5px solid rgba(239, 68, 68, 0.45)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'monospace',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                      }}
                      title="Last 24 Hours Countdown"
                    >
                      <Hourglass size={12} className="animate-spin" />
                      <span>{countdownFormatted} left</span>
                    </span>
                  ) : isLastDay ? (
                    /* LAST DAY: RED */
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                      }}
                    >
                      ● 1 day left (Last day)
                    </span>
                  ) : isLast5Days ? (
                    /* LAST 5 DAYS: ORANGE */
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#d97706',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                      }}
                    >
                      ● {diffDays} days remaining (Expiring soon)
                    </span>
                  ) : (
                    /* NORMAL (> 5 DAYS): GREEN */
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--accent-success, #10b981)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      ● {diffDays} days remaining
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Started: {company.startDate || '2026-04-01'} · Grace: {company.graceDays || 3} days
                </div>
              </div>
            </div>

            {/* Request Renewal Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1rem 1.25rem',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '0.65rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'block' }}>
                  Need to extend or renew your subscription?
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Click below to send an instant renewal request directly to the Super Admin portal.
                </p>
              </div>

              {isRenewalPending ? (
                <button
                  type="button"
                  disabled
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>Renewal Pending</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestRenewal}
                  disabled={isRequestingRenewal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.35rem',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: isRequestingRenewal ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px var(--accent-primary-glow)',
                    transition: 'all 0.2s',
                  }}
                >
                  <RotateCw size={15} className={isRequestingRenewal ? 'animate-spin' : ''} />
                  <span>{isRequestingRenewal ? 'Submitting...' : 'Request Renewal'}</span>
                </button>
              )}
            </div>

            {/* Enter New Key Form */}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                <Sparkles size={16} color="var(--accent-primary)" />
                <span>Activate New Key (Update Validity)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Received a new 16-digit activation key from Admin? Paste it here to instantly extend your license validity:
              </p>

              <form onSubmit={handleActivateKey} style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value.toUpperCase())}
                  placeholder="e.g. UDAAN-IVR-20261104"
                  maxLength={25}
                  style={{
                    flex: '1 1 280px',
                    padding: '0.7rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-color)')}
                />
                <button
                  type="submit"
                  disabled={isActivating || !newKeyInput.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.7rem 1.35rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    cursor: isActivating || !newKeyInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: isActivating || !newKeyInput.trim() ? 0.6 : 1,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Key size={14} />
                  <span>{isActivating ? 'Activating...' : 'Activate Key'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Security Section */}
        <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Security
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Manage your account security and password settings.</p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Password</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Request a password change from your administrator.</p>
              </div>
            </div>
            <button 
              onClick={handlePasswordRequest}
              disabled={isRequestingPassword}
              style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.375rem', fontWeight: '600', fontSize: '0.75rem', cursor: isRequestingPassword ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => !isRequestingPassword && (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {isRequestingPassword ? 'Requesting...' : 'Request Change'}
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Subscription Ending Soon Alert Popup */}
      {showExpiryModal && company && (
        <div className="sa-modal-backdrop" onClick={handleDismissModal} style={{ zIndex: 9999 }}>
          <div
            className="sa-modal-dialog animate-scale-up"
            style={{
              maxWidth: '520px',
              width: '92%',
              background: 'var(--bg-card)',
              borderRadius: '1rem',
              border: isLast24Hours || isExpired
                ? '1.5px solid rgba(239, 68, 68, 0.5)'
                : '1.5px solid rgba(245, 158, 11, 0.45)',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: isLast24Hours || isExpired ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isLast24Hours || isExpired ? '#ef4444' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isLast24Hours ? <Hourglass size={22} className="animate-spin" /> : <AlertTriangle size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {isExpired
                      ? 'Subscription Expired!'
                      : isLast24Hours
                      ? 'Urgent: Subscription Expiring Today!'
                      : 'Your Subscription is Ending Soon!'}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Tenant: <strong style={{ color: 'var(--text-primary)' }}>{company.name}</strong> ({company.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Countdown or Duration Box */}
            <div
              style={{
                background: isLast24Hours || isExpired ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: isLast24Hours || isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              {isLast24Hours ? (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#ef4444', letterSpacing: '0.05em' }}>
                    Time Remaining Before Lockout
                  </span>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      color: '#ef4444',
                      margin: '0.35rem 0',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {countdownFormatted}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Expires today at 11:59:59 PM ({company.endDate})
                  </div>
                </div>
              ) : isExpired ? (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#ef4444' }}>
                    Status
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>
                    Expired on {company.endDate}
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#d97706' }}>
                    Days Remaining
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', margin: '0.25rem 0' }}>
                    {diffDays} Days Left
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Valid Till: <strong>{company.endDate}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Your subscription plan is ending soon. To ensure uninterrupted dialer service, telecaller allocation, and report generation, please click <strong>Renew Subscription</strong> to notify Super Admin.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleDismissModal}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Remind Me Later
              </button>

              {isRenewalPending ? (
                <button
                  type="button"
                  disabled
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.35rem',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'not-allowed',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>Renewal Pending</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleRequestRenewal();
                  }}
                  disabled={isRequestingRenewal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.35rem',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: isRequestingRenewal ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px var(--accent-primary-glow)',
                  }}
                >
                  <RotateCw size={15} className={isRequestingRenewal ? 'animate-spin' : ''} />
                  <span>{isRequestingRenewal ? 'Submitting...' : 'Renew Subscription'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
