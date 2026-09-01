import { useState } from 'react';
import { Mail, CheckCircle2, Copy, X, Key, ShieldCheck, Send } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { useSuperAdminStore } from '../store';
import type { Company } from '../types';

interface SendCredentialsModalProps {
  company: Company | null;
  onClose: () => void;
}

export default function SendCredentialsModal({
  company,
  onClose,
}: SendCredentialsModalProps) {
  const sendCredentials = useSuperAdminStore((s) => s.sendCredentials);
  const [copied, setCopied] = useState(false);
  const [includePasswordReset, setIncludePasswordReset] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!company) return null;

  const tempPassword = `BNOrbit@${company.code.replace('BN-', '')}#2026`;
  const portalUrl = `${window.location.origin}/login`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied credentials to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      sendCredentials(company.id);
      setSending(false);
      setSentSuccess(true);
      toast.success(`Welcome credentials dispatched to ${company.contactEmail}`);
    }, 600);
  };

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal-dialog animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-header">
          <div className="sa-modal-title-wrap">
            <div className="sa-modal-icon-badge">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="sa-modal-title">Send Admin Login Credentials</h3>
              <p className="sa-modal-subtitle">
                Provision access for <strong>{company.name}</strong> ({company.code})
              </p>
            </div>
          </div>
          <button type="button" className="sa-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {sentSuccess ? (
          <div className="sa-modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Credentials Email Dispatched!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              An encrypted onboarding welcome email with login URL, administrator username, and temporary credentials was sent to{' '}
              <strong>{company.contactEmail}</strong>.
            </p>
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ minWidth: '140px' }}>
              Done
            </button>
          </div>
        ) : (
          <div className="sa-modal-body">
            <div className="sa-creds-preview-card">
              <div className="sa-creds-row">
                <span className="sa-creds-label">Recipient Admin:</span>
                <strong className="sa-creds-val">{company.contactName}</strong>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Login Email:</span>
                <strong className="sa-creds-val">{company.contactEmail}</strong>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Portal URL:</span>
                <code className="sa-creds-code">{portalUrl}</code>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Temp Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code className="sa-creds-code">{tempPassword}</code>
                  <button
                    type="button"
                    className="sa-copy-btn"
                    onClick={() => copyToClipboard(tempPassword)}
                    title="Copy password"
                  >
                    {copied ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="sa-checkbox-label">
                <input
                  type="checkbox"
                  checked={includePasswordReset}
                  onChange={(e) => setIncludePasswordReset(e.target.checked)}
                />
                <span>
                  <strong>Force password change on initial login</strong>
                  <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Ensures enterprise compliance and security hygiene.
                  </small>
                </span>
              </label>
            </div>

            <div className="sa-info-alert" style={{ marginTop: '1rem' }}>
              <ShieldCheck size={16} />
              <span>
                Tenant Admin will manage supervisors, telecallers, and portfolio allocation. Super Admin access remains isolated.
              </span>
            </div>

            <div className="sa-modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSend} disabled={sending}>
                <Send size={15} />
                {sending ? 'Dispatching...' : 'Send Access Credentials'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
