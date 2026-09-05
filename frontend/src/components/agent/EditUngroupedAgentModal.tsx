import React, { useState } from 'react';
import { X, UserCheck, Users, Megaphone, AlertCircle } from 'lucide-react';
import { useCampaignStore } from '../../store/campaignStore';
import type { AgentGroupMappingItem } from '../../pages/agent/MapAgentsCampaignsPage';

interface EditUngroupedAgentModalProps {
  isOpen: boolean;
  agentItem: AgentGroupMappingItem | null;
  groupsList: AgentGroupMappingItem[];
  onClose: () => void;
  onAssignToGroup: (agentItem: AgentGroupMappingItem, targetGroupId: string) => void;
  onUpdateAgentCampaign: (agentItemId: string, campaignName: string) => void;
}

export const EditUngroupedAgentModal: React.FC<EditUngroupedAgentModalProps> = ({
  isOpen,
  agentItem,
  groupsList,
  onClose,
  onAssignToGroup,
  onUpdateAgentCampaign,
}) => {
  const { campaignsList } = useCampaignStore();
  const [selectedGroupId, setSelectedGroupId] = useState(
    groupsList[0]?.id || ''
  );
  const [selectedCampaign, setSelectedCampaign] = useState(
    agentItem?.campaign === '-' ? 'Unassigned' : agentItem?.campaign || 'Unassigned'
  );
  const [activeActionTab, setActiveActionTab] = useState<'JOIN_GROUP' | 'SET_CAMPAIGN'>('JOIN_GROUP');

  if (!isOpen || !agentItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeActionTab === 'JOIN_GROUP') {
      if (!selectedGroupId) return;
      onAssignToGroup(agentItem, selectedGroupId);
    } else {
      const camp = selectedCampaign === 'Unassigned' ? '-' : selectedCampaign;
      onUpdateAgentCampaign(agentItem.id, camp);
    }
    onClose();
  };

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div
        className="agent-modal-dialog map-group-modal-dialog"
        style={{ maxWidth: '480px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <div className="map-group-modal-icon edit-icon-box">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="agent-modal-title">Manage Agent: {agentItem.name}</h3>
              <p className="map-group-modal-sub">
                Move agent into an active cluster or update campaign
              </p>
            </div>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Action selector */}
        <div className="map-ungrouped-modal-tabs">
          <button
            type="button"
            className={`map-ungrouped-tab ${activeActionTab === 'JOIN_GROUP' ? 'active' : ''}`}
            onClick={() => setActiveActionTab('JOIN_GROUP')}
          >
            <Users size={14} />
            <span>Add to Agent Group</span>
          </button>
          <button
            type="button"
            className={`map-ungrouped-tab ${activeActionTab === 'SET_CAMPAIGN' ? 'active' : ''}`}
            onClick={() => setActiveActionTab('SET_CAMPAIGN')}
          >
            <Megaphone size={14} />
            <span>Change Campaign</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="map-group-form" style={{ marginTop: '0.75rem' }}>
          {activeActionTab === 'JOIN_GROUP' ? (
            <div className="map-group-form-group">
              <label className="map-group-form-label">
                Select Target Agent Group to Join
              </label>
              <select
                className="map-group-select"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                {groupsList.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name} ({grp.agentsCount} agents • {grp.campaign || 'No Campaign'})
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Adding this agent will automatically increment the group's roster and inherit its campaign.
              </p>
            </div>
          ) : (
            <div className="map-group-form-group">
              <label className="map-group-form-label">
                Direct Campaign Mapping
              </label>
              <select
                className="map-group-select"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="Unassigned">Unassigned (-)</option>
                {campaignsList.map((camp) => (
                  <option key={camp.id} value={camp.name}>
                    {camp.name} ({camp.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="map-group-modal-footer" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
            >
              {activeActionTab === 'JOIN_GROUP' ? 'Add to Group' : 'Save Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUngroupedAgentModal;
