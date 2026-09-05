import React, { useState, useMemo } from 'react';
import {
  X, Edit2, Users, Search, UserMinus, UserPlus, Trash2,
  AlertCircle, CheckCircle2, Shield
} from 'lucide-react';
import { useCampaignStore } from '../../store/campaignStore';
import { useAgentStore } from '../../store/agentStore';
import type { AgentGroupMappingItem } from '../../pages/agent/MapAgentsCampaignsPage';

interface EditGroupModalProps {
  isOpen: boolean;
  group: AgentGroupMappingItem | null;
  onClose: () => void;
  onSave: (updatedGroup: AgentGroupMappingItem) => void;
  onDelete?: (groupId: string) => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  group,
  onClose,
  onSave,
  onDelete,
}) => {
  const { agentsList } = useAgentStore();
  const { campaignsList } = useCampaignStore();

  // Local editable state
  const [groupName, setGroupName] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [collections, setCollections] = useState('');
  const [status, setStatus] = useState('Active');
  const [assignedAgentIds, setAssignedAgentIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [addAgentSearchQuery, setAddAgentSearchQuery] = useState('');
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form when group changes
  React.useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setSelectedCampaign(group.campaign === '-' ? 'Unassigned' : group.campaign);
      setCollections(group.collections);
      setStatus(group.status || 'Active');
      setAssignedAgentIds(group.assignedAgentIds || []);
      setMemberSearchQuery('');
      setAddAgentSearchQuery('');
      setIsAddSectionOpen(false);
      setErrorMessage('');
      setShowDeleteConfirm(false);
    }
  }, [group]);

  // Existing members list
  const currentMembers = useMemo(() => {
    return agentsList.filter((a) => assignedAgentIds.includes(a.id));
  }, [agentsList, assignedAgentIds]);

  // Filtered members by search
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return currentMembers;
    const q = memberSearchQuery.toLowerCase();
    return currentMembers.filter(
      (a) =>
        a.agentName.toLowerCase().includes(q) ||
        a.bnId.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q)
    );
  }, [currentMembers, memberSearchQuery]);

  // Available agents not yet in this group
  const availableToAdd = useMemo(() => {
    return agentsList.filter((a) => !assignedAgentIds.includes(a.id));
  }, [agentsList, assignedAgentIds]);

  // Filtered available agents by search
  const availableToAddAgents = useMemo(() => {
    if (!addAgentSearchQuery.trim()) return availableToAdd;
    const q = addAgentSearchQuery.toLowerCase();
    return availableToAdd.filter(
      (a) =>
        a.agentName.toLowerCase().includes(q) ||
        a.bnId.toLowerCase().includes(q) ||
        a.area.toLowerCase().includes(q)
    );
  }, [availableToAdd, addAgentSearchQuery]);

  if (!isOpen || !group) return null;

  const handleRemoveAgent = (agentId: string) => {
    setAssignedAgentIds((prev) => prev.filter((id) => id !== agentId));
  };

  const handleAddAgent = (agentId: string) => {
    if (!assignedAgentIds.includes(agentId)) {
      setAssignedAgentIds((prev) => [...prev, agentId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setErrorMessage('Group name cannot be empty');
      return;
    }

    const updated: AgentGroupMappingItem = {
      ...group,
      name: groupName.trim(),
      campaign: selectedCampaign === 'Unassigned' ? '-' : selectedCampaign,
      collections: collections || group.collections,
      status,
      agentsCount: assignedAgentIds.length,
      assignedAgentIds,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div
        className="agent-modal-dialog map-group-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <div className="map-group-modal-icon edit-icon-box">
              <Edit2 size={18} />
            </div>
            <div>
              <h3 className="agent-modal-title">Edit Agent Group</h3>
              <p className="map-group-modal-sub">
                Modify group settings, assigned campaign, and manage member roster
              </p>
            </div>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="map-group-form">
          {errorMessage && (
            <div className="map-group-error-alert">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Group Details Grid */}
          <div className="map-group-form-grid">
            <div className="map-group-form-group">
              <label className="map-group-form-label">
                Group Name <span className="req-star">*</span>
              </label>
              <input
                type="text"
                className="map-group-input"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
              />
            </div>

            <div className="map-group-form-group">
              <label className="map-group-form-label">Assigned Campaign</label>
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

          <div className="map-group-form-grid">
            <div className="map-group-form-group">
              <label className="map-group-form-label">Collections Volume</label>
              <input
                type="text"
                className="map-group-input"
                value={collections}
                onChange={(e) => setCollections(e.target.value)}
              />
            </div>

            <div className="map-group-form-group">
              <label className="map-group-form-label">Group Status</label>
              <select
                className="map-group-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Group Members Management Section */}
          <div className="map-group-members-section">
            <div className="map-group-members-header">
              <div className="map-group-members-title-wrap">
                <Users size={15} className="map-section-icon" />
                <span className="map-group-members-title">
                  Current Group Agents ({assignedAgentIds.length})
                </span>
              </div>
              <button
                type="button"
                className={`map-group-add-toggle-btn ${isAddSectionOpen ? 'active' : ''}`}
                onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
              >
                <UserPlus size={13} />
                <span>{isAddSectionOpen ? 'Close Add Agents' : '+ Add More Agents'}</span>
              </button>
            </div>

            {/* Search within current members */}
            <div className="map-group-picker-search" style={{ marginBottom: '0.625rem' }}>
              <Search size={13} className="map-picker-search-icon" />
              <input
                type="text"
                placeholder="Search member by name, BN ID..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
              />
            </div>

            {/* Current Members List with Remove action */}
            <div className="map-group-agents-scroll" style={{ maxHeight: isAddSectionOpen ? '160px' : '220px' }}>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((agent) => {
                  const initial = agent.agentName.charAt(0).toUpperCase() || 'A';
                  return (
                    <div key={agent.id} className="map-agent-member-row">
                      <div className="map-agent-picker-left">
                        <div className="map-agent-picker-avatar">
                          <span>{initial}</span>
                        </div>
                        <div className="map-agent-picker-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <span className="map-agent-picker-name">{agent.agentName}</span>
                            <span
                              className={`badge ${
                                agent.type === 'FIELD' ? 'badge-warning' : 'badge-primary'
                              }`}
                              style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}
                            >
                              {agent.type}
                            </span>
                          </div>
                          <span className="map-agent-picker-meta">
                            {agent.bnId} • {agent.area} • Supervisor: {agent.supervisor}
                          </span>
                        </div>
                      </div>

                      <div className="map-agent-picker-right">
                        <button
                          type="button"
                          className="btn-remove-agent-from-group"
                          onClick={() => handleRemoveAgent(agent.id)}
                          title={`Remove ${agent.agentName} from group`}
                        >
                          <UserMinus size={13} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="map-group-empty-agents">
                  <p>
                    {assignedAgentIds.length === 0
                      ? 'No agents currently in this group. Click "+ Add More Agents" to add.'
                      : 'No agents match your search filter.'}
                  </p>
                </div>
              )}
            </div>

            {/* Add More Agents Accordion Drawer */}
            {isAddSectionOpen && (
              <div className="map-add-agents-drawer">
                <div className="map-drawer-header">
                  <span className="map-drawer-title">Available Agents to Add</span>
                  <div className="map-drawer-search">
                    <Search size={12} className="map-picker-search-icon" />
                    <input
                      type="text"
                      placeholder="Filter available agents..."
                      value={addAgentSearchQuery}
                      onChange={(e) => setAddAgentSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="map-drawer-scroll">
                  {availableToAddAgents.length > 0 ? (
                    availableToAddAgents.map((agent) => {
                      const initial = agent.agentName.charAt(0).toUpperCase() || 'A';
                      return (
                        <div key={agent.id} className="map-drawer-agent-row">
                          <div className="map-agent-picker-left">
                            <div className="map-agent-picker-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                              <span>{initial}</span>
                            </div>
                            <div className="map-agent-picker-info">
                              <span className="map-agent-picker-name" style={{ fontSize: '0.75rem' }}>{agent.agentName}</span>
                              <span className="map-agent-picker-meta" style={{ fontSize: '0.65rem' }}>
                                {agent.bnId} • {agent.type} • {agent.area}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn-add-agent-to-group"
                            onClick={() => handleAddAgent(agent.id)}
                          >
                            <UserPlus size={12} />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="map-group-empty-agents" style={{ padding: '1rem' }}>
                      <p>All available agents are already in this group.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delete confirmation section */}
          {showDeleteConfirm ? (
            <div className="map-delete-confirm-box">
              <AlertCircle size={16} className="map-delete-confirm-icon" />
              <span>Are you sure you want to delete this group?</span>
              <div className="map-delete-confirm-actions">
                <button
                  type="button"
                  className="btn-delete-confirm-yes"
                  onClick={() => {
                    if (onDelete) onDelete(group.id);
                    onClose();
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  className="btn-delete-confirm-no"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {/* Modal Footer */}
          <div className="map-group-modal-footer">
            <div className="map-footer-left">
              {onDelete && !showDeleteConfirm && (
                <button
                  type="button"
                  className="btn-modal-delete-group"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} />
                  <span>Delete Group</span>
                </button>
              )}
            </div>

            <div className="map-footer-right">
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
                Save Changes ({assignedAgentIds.length} Agents)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
