import React, { useState, useEffect } from 'react';
import { X, Edit3, CheckCircle2, Zap, PlayCircle, Sliders, Eye } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';

interface EditCampaignModalProps {
  isOpen: boolean;
  campaign: CampaignItem | null;
  onClose: () => void;
  onCampaignUpdated: (updatedCamp: CampaignItem) => void;
}

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  isOpen,
  campaign,
  onClose,
  onCampaignUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'PREDICTIVE' as 'PREDICTIVE' | 'MANUAL' | 'PROGRESSIVE' | 'PREVIEW',
    targetQueue: 'Tier-1 Overdue',
    strategy: 'High Velocity Ratio 3:1',
    agentsCount: 1,
    status: 'Running' as 'Running' | 'Paused' | 'Completed',
  });

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        category: campaign.category,
        targetQueue: campaign.targetQueue || 'Tier-1 Overdue',
        strategy: campaign.strategy || 'High Velocity Ratio 3:1',
        agentsCount: campaign.agentsCount,
        status: campaign.status,
      });
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const categories = [
    { id: 'PREDICTIVE', label: 'Predictive', desc: 'Auto-dial with predictive pace', icon: Zap },
    { id: 'PROGRESSIVE', label: 'Progressive', desc: '1:1 dial upon agent availability', icon: PlayCircle },
    { id: 'MANUAL', label: 'Manual', desc: 'Agent manually clicks to dial', icon: Sliders },
    { id: 'PREVIEW', label: 'Preview', desc: 'Agent reviews borrower data first', icon: Eye },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    const updated: CampaignItem = {
      ...campaign,
      name: formData.name.trim(),
      category: formData.category,
      agentsCount: Number(formData.agentsCount) || 1,
      status: formData.status,
      strategy: formData.strategy,
      targetQueue: formData.targetQueue,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onCampaignUpdated(updated);
      setIsSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="campaign-modal-backdrop" onClick={onClose}>
      <div className="campaign-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="campaign-modal-header">
          <div className="campaign-modal-title-wrap">
            <div className="campaign-modal-icon-box">
              <Edit3 size={18} className="campaign-modal-icon" />
            </div>
            <div>
              <h3 className="campaign-modal-title">Edit Campaign</h3>
              <p className="campaign-modal-sub">Update campaign parameters and agent assignments</p>
            </div>
          </div>
          <button type="button" className="campaign-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="campaign-modal-success-state">
            <div className="campaign-success-icon-box">
              <CheckCircle2 size={36} className="success-icon" />
            </div>
            <h4>Changes Saved!</h4>
            <p>Campaign "{formData.name}" has been updated successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="campaign-modal-form">
            {error && <div className="campaign-modal-error">{error}</div>}

            <div className="campaign-form-group">
              <label>Campaign Name <span className="req-star">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="campaign-form-input"
              />
            </div>

            <div className="campaign-form-group">
              <label>Dialing Mode</label>
              <div className="campaign-mode-grid">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`campaign-mode-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.id as any })}
                    >
                      <div className="mode-card-header">
                        <Icon size={15} className="mode-icon" />
                        <span className="mode-card-title">{cat.label}</span>
                      </div>
                      <span className="mode-card-desc">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="campaign-form-grid">
              <div className="campaign-form-group">
                <label>Target Queue</label>
                <select
                  value={formData.targetQueue}
                  onChange={(e) => setFormData({ ...formData, targetQueue: e.target.value })}
                  className="campaign-form-input"
                >
                  <option value="Tier-1 Overdue">Tier-1 Overdue</option>
                  <option value="NPA Stage 2">NPA Stage 2</option>
                  <option value="Fresh Allotment">Fresh Allotment</option>
                  <option value="VIP Collections">VIP Collections</option>
                  <option value="Bucket 1 Soft Reminders">Bucket 1 Soft Reminders</option>
                  <option value="Manual Outreach">Manual Outreach</option>
                </select>
              </div>

              <div className="campaign-form-group">
                <label>Dialing Strategy</label>
                <select
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="campaign-form-input"
                >
                  <option value="High Velocity Ratio 3:1">High Velocity Ratio 3:1</option>
                  <option value="Standard Ratio 2:1">Standard Ratio 2:1</option>
                  <option value="Sequential Ratio 1:1">Sequential Ratio 1:1</option>
                  <option value="Adaptive Dialing">Adaptive Dialing</option>
                  <option value="Pre-call Intel & Preview">Pre-call Intel & Preview</option>
                  <option value="Direct Click-to-Call">Direct Click-to-Call</option>
                </select>
              </div>
            </div>

            <div className="campaign-form-grid">
              <div className="campaign-form-group">
                <label>Assigned Agents</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.agentsCount}
                  onChange={(e) => setFormData({ ...formData, agentsCount: Number(e.target.value) })}
                  className="campaign-form-input"
                />
              </div>

              <div className="campaign-form-group">
                <label>Campaign Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="campaign-form-input"
                >
                  <option value="Running">Running</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="campaign-modal-footer">
              <button type="button" className="btn-camp-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-camp-submit-primary">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditCampaignModal;
