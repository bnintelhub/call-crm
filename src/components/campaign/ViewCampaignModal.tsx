import React from 'react';
import { X, Megaphone, Users, Phone, Zap, PlayCircle, Sliders, Eye, Calendar, Target, Activity } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';
import CampaignStatusBadge from './CampaignStatusBadge';

interface ViewCampaignModalProps {
  isOpen: boolean;
  campaign: CampaignItem | null;
  onClose: () => void;
  onEditClick: (campaign: CampaignItem) => void;
}

export const ViewCampaignModal: React.FC<ViewCampaignModalProps> = ({
  isOpen,
  campaign,
  onClose,
  onEditClick,
}) => {
  if (!isOpen || !campaign) return null;

  const getModeIcon = (cat: string) => {
    switch (cat) {
      case 'PREDICTIVE':
        return Zap;
      case 'PROGRESSIVE':
        return PlayCircle;
      case 'MANUAL':
        return Sliders;
      case 'PREVIEW':
        return Eye;
      default:
        return Zap;
    }
  };

  const ModeIcon = getModeIcon(campaign.category);

  return (
    <div className="campaign-modal-backdrop" onClick={onClose}>
      <div className="campaign-modal-dialog modal-view-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="campaign-modal-header">
          <div className="campaign-modal-title-wrap">
            <div className="campaign-modal-icon-box">
              <Megaphone size={18} className="campaign-modal-icon" />
            </div>
            <div>
              <div className="modal-view-title-row">
                <h3 className="campaign-modal-title">{campaign.name}</h3>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <p className="campaign-modal-sub">Campaign ID: {campaign.id}</p>
            </div>
          </div>
          <button type="button" className="campaign-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="campaign-view-body">
          {/* Key Metrics Grid */}
          <div className="campaign-view-metrics-grid">
            <div className="view-metric-card">
              <span className="view-metric-label">Dialing Mode</span>
              <div className="view-metric-val-wrap">
                <ModeIcon size={14} className="view-metric-icon text-indigo" />
                <span className="view-metric-val">{campaign.category}</span>
              </div>
            </div>

            <div className="view-metric-card">
              <span className="view-metric-label">Assigned Agents</span>
              <div className="view-metric-val-wrap">
                <Users size={14} className="view-metric-icon text-cyan" />
                <span className="view-metric-val">{campaign.agentsCount} Active</span>
              </div>
            </div>

            <div className="view-metric-card">
              <span className="view-metric-label">Borrowers Contacted</span>
              <div className="view-metric-val-wrap">
                <Phone size={14} className="view-metric-icon text-emerald" />
                <span className="view-metric-val">{campaign.completedAutodial.toLocaleString()}</span>
              </div>
            </div>

            <div className="view-metric-card">
              <span className="view-metric-label">Contactability Rate</span>
              <div className="view-metric-val-wrap">
                <Activity size={14} className="view-metric-icon text-purple" />
                <span className="view-metric-val">{campaign.contactability}%</span>
              </div>
            </div>
          </div>

          {/* Configuration List */}
          <div className="campaign-view-section">
            <h4 className="view-section-title">Configuration & Strategy</h4>
            <div className="view-detail-list">
              <div className="view-detail-row">
                <span className="detail-key">Target Queue:</span>
                <span className="detail-val">{campaign.targetQueue || 'Tier-1 Overdue'}</span>
              </div>
              <div className="view-detail-row">
                <span className="detail-key">Dialing Strategy:</span>
                <span className="detail-val">{campaign.strategy || 'High Velocity Ratio 3:1'}</span>
              </div>
              <div className="view-detail-row">
                <span className="detail-key">Total Borrowers:</span>
                <span className="detail-val">{campaign.borrowerCount.toLocaleString()} Accounts</span>
              </div>
              <div className="view-detail-row">
                <span className="detail-key">Remaining / Left Out:</span>
                <span className="detail-val">{campaign.leftOutBorrower.toLocaleString()} Accounts</span>
              </div>
              <div className="view-detail-row">
                <span className="detail-key">Created Date:</span>
                <span className="detail-val">{campaign.createdAt || '2026-08-31'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="campaign-modal-footer">
          <button type="button" className="btn-camp-cancel" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-camp-submit-primary"
            onClick={() => {
              onClose();
              onEditClick(campaign);
            }}
          >
            Edit Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCampaignModal;
