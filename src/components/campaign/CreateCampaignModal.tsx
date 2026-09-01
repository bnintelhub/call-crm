import React, { useState } from 'react';
import { X, Megaphone, CheckCircle2, Zap, PlayCircle, Sliders, Eye } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (newCamp: CampaignItem) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'PREDICTIVE' as 'PREDICTIVE' | 'MANUAL' | 'PROGRESSIVE' | 'PREVIEW',
    targetQueue: 'Tier-1 Overdue',
    strategy: 'High Velocity Ratio 3:1',
    agentsCount: 4,
    status: 'Running' as 'Running' | 'Paused',
  });

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

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

    const newCamp: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      borrowerCount: 0,
      leftOutBorrower: 0,
      contactability: 0,
      agentsCount: Number(formData.agentsCount) || 1,
      completedAutodial: 0,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      strategy: formData.strategy,
      targetQueue: formData.targetQueue,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onCampaignCreated(newCamp);
      setIsSuccess(false);
      onClose();
      // Reset form
      setFormData({
        name: '',
        category: 'PREDICTIVE',
        targetQueue: 'Tier-1 Overdue',
        strategy: 'High Velocity Ratio 3:1',
        agentsCount: 4,
        status: 'Running',
      });
    }, 700);
  };

  return (
    <div className="campaign-modal-backdrop" onClick={onClose}>
      <div className="campaign-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="campaign-modal-header">
          <div className="campaign-modal-title-wrap">
            <div className="campaign-modal-icon-box">
              <Megaphone size={18} className="campaign-modal-icon" />
            </div>
            <div>
              <h3 className="campaign-modal-title">Create New Campaign</h3>
              <p className="campaign-modal-sub">Configure live dialer parameters and agent capacity</p>
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
            <h4>Campaign Initialized!</h4>
            <p>"{formData.name}" has been created and set to {formData.status}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="campaign-modal-form">
            {error && <div className="campaign-modal-error">{error}</div>}

            {/* Campaign Name */}
            <div className="campaign-form-group">
              <label>Campaign Name <span className="req-star">*</span></label>
              <input
                type="text"
                placeholder="e.g. Q3_Recovery_High_Ticket"
                value={formData.name}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="campaign-form-input"
                autoFocus
              />
            </div>

            {/* Dialing Category Cards */}
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

            {/* Grid for Queue & Strategy */}
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

            {/* Grid for Agents & Initial Status */}
            <div className="campaign-form-grid">
              <div className="campaign-form-group">
                <label>Assigned Agents</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.agentsCount}
                  onChange={(e) => setFormData({ ...formData, agentsCount: Number(e.target.value) })}
                  className="campaign-form-input"
                />
              </div>

              <div className="campaign-form-group">
                <label>Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="campaign-form-input"
                >
                  <option value="Running">Running (Active)</option>
                  <option value="Paused">Paused (Standby)</option>
                </select>
              </div>
            </div>

            <div className="campaign-modal-footer">
              <button type="button" className="btn-camp-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-camp-submit-primary">
                Create Campaign
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCampaignModal;
