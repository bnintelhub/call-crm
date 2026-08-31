import React, { useState } from 'react';
import { X, Share2, Copy, Check, QrCode, Smartphone, MessageSquare } from 'lucide-react';

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareInviteModal: React.FC<ShareInviteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://app.moneyview.in/agent/invite?code=MV-RNC-5250';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="agent-modal-backdrop">
      <div className="agent-modal-dialog">
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <Share2 size={20} className="agent-modal-icon" />
            <h3 className="agent-modal-title">Share App Invite</h3>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="agent-modal-body">
          <p className="invite-desc">
            Share this registration link with agents to download the mobile application and onboard directly.
          </p>

          <div className="invite-link-box">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="invite-link-input"
            />
            <button
              type="button"
              className={`invite-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="invite-channels-grid">
            <div className="invite-channel-item" onClick={handleCopy}>
              <div className="channel-icon-circle whatsapp">
                <MessageSquare size={20} />
              </div>
              <span className="channel-title">WhatsApp</span>
            </div>

            <div className="invite-channel-item" onClick={handleCopy}>
              <div className="channel-icon-circle sms">
                <Smartphone size={20} />
              </div>
              <span className="channel-title">SMS Invite</span>
            </div>

            <div className="invite-channel-item" onClick={handleCopy}>
              <div className="channel-icon-circle qr">
                <QrCode size={20} />
              </div>
              <span className="channel-title">Scan QR</span>
            </div>
          </div>
        </div>

        <div className="agent-modal-footer">
          <button type="button" className="btn-agent-submit" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareInviteModal;
