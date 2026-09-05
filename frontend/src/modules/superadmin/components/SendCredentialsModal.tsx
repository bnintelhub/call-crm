import { useState } from 'react';
import { Mail, CheckCircle2, Copy, X, Key, ShieldCheck, Send, Users } from 'lucide-react';
import { toast } from '../../../components/shared/Toast';
import { useSuperAdminStore } from '../store';
import { generateLoginEmail } from '../utils/activationKey';
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
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [includePasswordReset, setIncludePasswordReset] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!company) return null;

  const codeDigits = company.code ? String(company.code).replace(/[^0-9]/g, '') : '1000';
  const password = company.adminPassword || `BNOrbit@${codeDigits}#2026`;
  const activationKey = company.activationKey || 'BN10-ORBX-2609-P4Q8';
  const loginEmail = company.loginEmail || generateLoginEmail(company.contactName || 'admin', company.name || 'company', codeDigits);
  const portalUrl = `${window.location.origin}/login`;
  const userCount = company.quotas?.telecallers || company.quotas?.seats || 10;

  const getInviteText = () => {
    return `==============================
BNORBIT CRM - ACCESS CREDENTIALS
==============================
Company        : ${company.name} (${company.city})
Admin Name     : ${company.contactName}
Login Email    : ${loginEmail}
Password       : ${password}
Portal URL     : ${portalUrl}

Contact Email  : ${company.contactEmail}
ACTIVATION KEY : ${activationKey}
User Limit     : ${userCount} Telecaller Seats
Valid Till     : ${company.endDate}
==============================
Supervisor profile me ja kar ye key enter karein to activate all allocated modules and telecaller slots.`;
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPass(true);
    toast.success('Copied password to clipboard');
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(activationKey);
    setCopiedKey(true);
    toast.success('Copied activation key');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyAllCredentials = () => {
    const text = getInviteText();
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success('Complete invite & key copied to clipboard!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const openGmailCompose = () => {
    const subject = encodeURIComponent(`BNORBIT CRM - Access Credentials & Activation Key for ${company.name}`);
    const body = encodeURIComponent(getInviteText());
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(company.contactEmail)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      sendCredentials(company.id);
      setSending(false);
      setSentSuccess(true);
      toast.success(`Credentials dispatched to system log for ${company.contactEmail}`);
    }, 600);
  };

  return (
    <div className="sa-modal-backdrop" onClick={onClose}>
      <div className="sa-modal-dialog animate-scale-up" style={{ maxWidth: '580px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="sa-modal-header">
          <div className="sa-modal-title-wrap">
            <div className="sa-modal-icon-badge">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="sa-modal-title">Admin Credentials & Key</h3>
              <p className="sa-modal-subtitle">
                Access dispatch for <strong>{company.name}</strong> ({company.code})
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
              Credentials & Key Dispatched!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Logged in the system audit trail for <strong>{company.contactEmail}</strong>. You can also send directly via Gmail or copy the invite.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={openGmailCompose}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Mail size={15} /> Open in Gmail
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={copyAllCredentials}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Copy size={15} /> {copiedAll ? 'Copied!' : 'Copy Full Invite'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="sa-modal-body">
            {/* Activation Key Callout Box */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1.5px dashed var(--accent-success)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-success)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Key size={13} /> 16-Digit Activation Key ({userCount} Users)
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {activationKey}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyKey}
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {copiedKey ? <CheckCircle2 size={13} color="var(--accent-success)" /> : <Copy size={13} />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="sa-creds-preview-card">
              <div className="sa-creds-row">
                <span className="sa-creds-label">Recipient Admin:</span>
                <strong className="sa-creds-val">{company.contactName}</strong>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Portal Login Email:</span>
                <strong className="sa-creds-val" style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{loginEmail}</strong>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Contact / Inbox:</span>
                <strong className="sa-creds-val">{company.contactEmail}</strong>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Portal URL:</span>
                <code className="sa-creds-code">{portalUrl}</code>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Admin Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code className="sa-creds-code">{password}</code>
                  <button
                    type="button"
                    className="sa-copy-btn"
                    onClick={copyPassword}
                    title="Copy password"
                  >
                    {copiedPass ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="sa-creds-row">
                <span className="sa-creds-label">Authorized Limit:</span>
                <strong className="sa-creds-val" style={{ color: 'var(--accent-primary)' }}>
                  <Users size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {userCount} Telecaller Accounts
                </strong>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label className="sa-checkbox-label" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={includePasswordReset}
                  onChange={(e) => setIncludePasswordReset(e.target.checked)}
                />
                <span>
                  <strong>Force password change on initial login</strong>
                </span>
              </label>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={copyAllCredentials}
                style={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {copiedAll ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                <span>{copiedAll ? 'Invite Copied!' : 'Copy Full Invite'}</span>
              </button>
            </div>

            <div className="sa-info-alert" style={{ marginTop: '1rem' }}>
              <ShieldCheck size={16} />
              <span>
                Supervisor enters the activation key in their profile settings. This key automatically authorizes up to {userCount} telecaller logins.
              </span>
            </div>

            <div className="sa-modal-actions" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={openGmailCompose}
                disabled={sending}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Directly opens Gmail compose with pre-filled credentials"
              >
                <Mail size={15} /> Open in Gmail
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
