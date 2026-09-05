import React, { useState, useMemo } from 'react';
import { X, Users, UserPlus, Search, Check, Shield, AlertCircle } from 'lucide-react';
import { useCampaignStore } from '../../store/campaignStore';
import { useAgentStore } from '../../store/agentStore';
import type { AgentGroupMappingItem } from '../../pages/agent/MapAgentsCampaignsPage';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: AgentGroupMappingItem) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const { agentsList } = useAgentStore();
  const { campaignsList } = useCampaignStore();
  const [groupName, setGroupName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(
    campaignsList[0]?.name || 'Unassigned'
  );
  const [collectionsEstimate, setCollectionsEstimate] = useState('₹15.0 Lakh');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CALL' | 'FIELD'>('ALL');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtered available agents
  const availableAgents = useMemo(() => {
    return agentsList.filter((agent) => {
      if (roleFilter !== 'ALL' && agent.type !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        agent.agentName.toLowerCase().includes(q) ||
        agent.bnId.toLowerCase().includes(q) ||
        agent.area.toLowerCase().includes(q)
      );
    });
  }, [agentsList, searchQuery, roleFilter]);

  if (!isOpen) return null;

  const handleToggleAgent = (id: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = availableAgents.map((a) => a.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedAgentIds.includes(id));

    if (allVisibleSelected) {
      setSelectedAgentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedAgentIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMessage('Please enter a valid group name');
      return;
    }

    const newGroup: AgentGroupMappingItem = {
      id: `grp-${Date.now()}`,
      name: groupName.trim(),
      agentsCount: selectedAgentIds.length,
      collections: collectionsEstimate || '₹0 Lakh',
      campaign: selectedCampaign === 'Unassigned' ? '-' : selectedCampaign,
      status: 'Active',
      type: 'GROUP',
      assignedAgentIds: selectedAgentIds,
    };

    onCreateGroup(newGroup);
    // Reset state & close
    setGroupName('');
    setSelectedAgentIds([]);
    setErrorMessage('');
    onClose();
  };

  const allVisibleSelected =
    availableAgents.length > 0 &&
    availableAgents.every((a) => selectedAgentIds.includes(a.id));

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div
        className="agent-modal-dialog map-group-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <div className="map-group-modal-icon">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="agent-modal-title">Create Agent Group</h3>
              <p className="map-group-modal-sub">
                Group telecallers & field agents together to map to campaigns
              </p>
            </div>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="map-group-form">
          {errorMessage && (
            <div className="map-group-error-alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Group Details */}
          <div className="map-group-form-grid">
            <div className="map-group-form-group">
              <label className="map-group-form-label">
                Group Name <span className="req-star">*</span>
              </label>
              <input
                type="text"
                className="map-group-input"
                placeholder="e.g. Priority Collections Cluster"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
              />
            </div>

            <div className="map-group-form-group">
              <label className="map-group-form-label">Assign Campaign</label>
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
          </div>

          <div className="map-group-form-group">
            <label className="map-group-form-label">Target Collections Estimate</label>
            <input
              type="text"
              className="map-group-input"
              placeholder="e.g. ₹20.5 Lakh"
              value={collectionsEstimate}
              onChange={(e) => setCollectionsEstimate(e.target.value)}
            />
          </div>

          {/* Member Selection Section */}
          <div className="map-group-members-section">
            <div className="map-group-members-header">
              <div className="map-group-members-title-wrap">
                <Users size={15} className="map-section-icon" />
                <span className="map-group-members-title">
                  Select Agents to Include ({selectedAgentIds.length} Selected)
                </span>
              </div>
              <button
                type="button"
                className="map-group-select-all-btn"
                onClick={handleSelectAllVisible}
              >
                {allVisibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
              </button>
            </div>

            {/* Filters */}
            <div className="map-group-picker-filters">
              <div className="map-group-picker-search">
                <Search size={13} className="map-picker-search-icon" />
                <input
                  type="text"
                  placeholder="Search agent by name or BN ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="map-group-filter-pills">
                <button
                  type="button"
                  className={`map-filter-pill ${roleFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setRoleFilter('ALL')}
                >
                  All ({agentsList.length})
                </button>
                <button
                  type="button"
                  className={`map-filter-pill ${roleFilter === 'CALL' ? 'active' : ''}`}
                  onClick={() => setRoleFilter('CALL')}
                >
                  Call ({agentsList.filter((a) => a.type === 'CALL').length})
                </button>
                <button
                  type="button"
                  className={`map-filter-pill ${roleFilter === 'FIELD' ? 'active' : ''}`}
                  onClick={() => setRoleFilter('FIELD')}
                >
                  Field ({agentsList.filter((a) => a.type === 'FIELD').length})
                </button>
              </div>
            </div>

            {/* Scrollable Agent List */}
            <div className="map-group-agents-scroll">
              {availableAgents.length > 0 ? (
                availableAgents.map((agent) => {
                  const isChecked = selectedAgentIds.includes(agent.id);
                  const initial = agent.agentName.charAt(0).toUpperCase() || 'A';
                  return (
                    <div
                      key={agent.id}
                      className={`map-agent-picker-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleAgent(agent.id)}
                    >
                      <div className="map-agent-picker-left">
                        <input
                          type="checkbox"
                          className="map-checkbox-input"
                          checked={isChecked}
                          onChange={() => {}} // handled by row click
                          aria-label={`Select ${agent.agentName}`}
                        />
                        <div className="map-agent-picker-avatar">
                          <span>{initial}</span>
                        </div>
                        <div className="map-agent-picker-info">
                          <span className="map-agent-picker-name">{agent.agentName}</span>
                          <span className="map-agent-picker-meta">
                            {agent.bnId} • {agent.area} • Exp: {agent.experience}
                          </span>
                        </div>
                      </div>

                      <div className="map-agent-picker-right">
                        <span
                          className={`badge ${
                            agent.type === 'FIELD' ? 'badge-warning' : 'badge-primary'
                          }`}
                          style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                        >
                          {agent.type}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="map-group-empty-agents">
                  <p>No matching agents found</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="map-group-modal-footer">
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
              Create Group ({selectedAgentIds.length} Agents)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
