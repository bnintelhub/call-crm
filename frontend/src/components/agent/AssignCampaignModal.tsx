import React, { useState } from 'react';
import { X, Layers, CheckCircle2, Megaphone } from 'lucide-react';
import { initialCampaignsData } from '../../data/campaignData';

interface AssignCampaignModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onAssign: (campaignName: string) => void;
}

export const AssignCampaignModal: React.FC<AssignCampaignModalProps> = ({
  isOpen,
  selectedCount,
  onClose,
  onAssign,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState(
    initialCampaignsData[0]?.name || 'Q3_Recovery_High_Ticket'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setIsSuccess(true);
    setTimeout(() => {
      onAssign(selectedCampaign);
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div className="agent-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <div className="agent-modal-icon-box" style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.12)', borderRadius: '6px', color: '#4f46e5' }}>
              <Megaphone size={17} />
            </div>
            <div>
              <h3 className="agent-modal-title" style={{ fontSize: '1rem', fontWeight: 600 }}>Assign Campaign</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Mapping to {selectedCount} selected {selectedCount === 1 ? 'target' : 'targets'}
              </p>
            </div>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={40} style={{ color: '#10b981' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>Campaign Mapped!</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              Assigned "{selectedCampaign}" successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select Active Campaign
              </label>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="agent-form-input"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input, #ffffff)', color: 'var(--text-primary)', fontSize: '0.8125rem', outline: 'none' }}
              >
                {initialCampaignsData.map((camp) => (
                  <option key={camp.id} value={camp.name}>
                    {camp.name} ({camp.category})
                  </option>
                ))}
                <option value="Special NPA Outbound">Special NPA Outbound</option>
                <option value="Tier-1 Early Overdue Reminders">Tier-1 Early Overdue Reminders</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0.45rem 0.875rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '0.45rem 1.125rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignCampaignModal;
