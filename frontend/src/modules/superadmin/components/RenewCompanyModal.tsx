import { useState, useMemo } from 'react';
import { RotateCw, Calendar, Key, CheckCircle2, Copy, X, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { useSuperAdminStore } from '../store';
import { generateActivationKey } from '../utils/activationKey';
import type { Company } from '../types';

interface RenewCompanyModalProps {
  company: Company | null;
  onClose: () => void;
  onRenewSuccess: (renewedCompany: Company) => void;
}

const EXTENSION_OPTIONS = [
  { days: 30, label: '+30 Days', desc: '1 Month' },
  { days: 90, label: '+90 Days', desc: '3 Months' },
  { days: 180, label: '+180 Days', desc: '6 Months' },
  { days: 365, label: '+365 Days', desc: '1 Year' },
  { days: -1, label: 'Custom', desc: 'Pick date' },
];

export default function RenewCompanyModal({
  company,
  onClose,
  onRenewSuccess,
}: RenewCompanyModalProps) {
  const renewCompanySubscription = useSuperAdminStore((s) => s.renewCompanySubscription);
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [customDate, setCustomDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Plan tag (IVR or CRM)
  const hasIvr = (company?.features || []).some(
    (f) => f.startsWith('ivr_') || f === 'call_recordings'
  );
  const planTag = hasIvr ? 'IVR' : 'CRM';

  // Base date calculation: if company endDate is in future, add to endDate, else add to today
  const newEndDate = useMemo(() => {
    if (!company) return '';
    if (selectedDays === -1 && customDate) {
      return customDate;
    }

    const daysToAdd = selectedDays > 0 ? selectedDays : 30;
    const now = new Date();
    const currentEnd = company.endDate ? new Date(company.endDate) : now;
    const baseDate = currentEnd > now ? currentEnd : now;

    const next = new Date(baseDate);
    next.setDate(next.getDate() + daysToAdd);
    return next.toISOString().slice(0, 10);
  }, [company, selectedDays, customDate]);

  // Generate the new 16-digit activation key with the new validity date
  const generatedKey = useMemo(() => {
    if (!company || !newEndDate) return '';
    return generateActivationKey(company.name, planTag, newEndDate);
  }, [company, planTag, newEndDate]);

  if (!company) return null;

  const handleCopyNewKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    toast.success('Copied new activation key to clipboard');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirm = () => {
    if (!newEndDate) {
      toast.error('Please select a valid expiry date');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      renewCompanySubscription(company.id, newEndDate, generatedKey);
      setIsProcessing(false);
      toast.success(`Subscription renewed for ${company.name}! New key issued.`);

      const updatedCompany: Company = {
        ...company,
        activationKey: generatedKey,
        activationKeyStatus: 'active',
        endDate: newEndDate,
        renewalRequested: false,
        lastRenewedAt: new Date().toISOString(),
        status: (company.status === 'suspended' || company.status === 'expired') ? 'active' : company.status,
      };

      onRenewSuccess(updatedCompany);
    }, 400);
  };

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div
        className="sa-modal-dialog animate-scale-up"
        style={{ maxWidth: '560px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sa-modal-header">
          <div className="sa-modal-title-wrap">
            <div
              className="sa-modal-icon-badge"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}
            >
              <RotateCw size={20} />
            </div>
            <div>
              <h3 className="sa-modal-title">Renew Subscription & Issue Key</h3>
              <p className="sa-modal-subtitle">
                {company.name} ({company.code}) · {company.city}
              </p>
            </div>
          </div>
          <button type="button" className="sa-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="sa-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {company.renewalRequested && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <strong>Renewal Requested by Supervisor:</strong> This tenant submitted an in-app renewal request.
                Generating and sending this key will complete the renewal.
              </div>
            </div>
          )}

          {/* Current Info Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              background: 'var(--bg-secondary)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Current Validity Till
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <Clock size={13} color="var(--accent-primary)" /> {company.endDate || 'N/A'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                Current Key
              </span>
              <code style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.2rem', display: 'block' }}>
                {company.activationKey || 'None'}
              </code>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Select Renewal Duration
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.5rem' }}>
              {EXTENSION_OPTIONS.map((opt) => {
                const isSelected = selectedDays === opt.days;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedDays(opt.days)}
                    style={{
                      padding: '0.6rem 0.5rem',
                      borderRadius: '8px',
                      border: isSelected
                        ? '1.5px solid var(--accent-primary)'
                        : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedDays === -1 && (
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Choose Custom End Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>

          {/* New Key & Expiry Preview Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <Sparkles size={14} /> New 16-Digit Activation Key
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                <Calendar size={13} color="var(--accent-primary)" />
                <span>New Expiry: <strong>{newEndDate}</strong></span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-card)',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
              }}
            >
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: 'var(--accent-primary)',
                }}
              >
                {generatedKey}
              </code>
              <button
                type="button"
                onClick={handleCopyNewKey}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: copiedKey ? 'var(--accent-success)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
                title="Copy generated key"
              >
                {copiedKey ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
              Format: <span style={{ fontFamily: 'monospace' }}>COMPANY(5)-PLAN(3)-YYYYMMDD(8)</span>.
              Validity date is cryptographically stamped directly into the key.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sa-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={isProcessing || !newEndDate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px var(--accent-primary-glow)',
            }}
          >
            <Key size={14} />
            <span>{isProcessing ? 'Issuing Key...' : 'Confirm Renewal & Issue Key'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
