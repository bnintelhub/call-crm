import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, ArrowUpDown, ChevronDown,
  Inbox, CheckCircle2, Edit2, MoreHorizontal, Trash2,
  UserPlus, Users, Plus
} from 'lucide-react';
import AssignCampaignModal from '../../components/agent/AssignCampaignModal';
import CreateGroupModal from '../../components/agent/CreateGroupModal';
import EditGroupModal from '../../components/agent/EditGroupModal';
import EditUngroupedAgentModal from '../../components/agent/EditUngroupedAgentModal';
import './MapAgentsCampaignsPage.css';

export interface AgentGroupMappingItem {
  id: string;
  name: string;
  agentsCount: number;
  collections: string;
  campaign: string;
  status?: string;
  type: 'GROUP' | 'UNGROUPED';
  assignedAgentIds?: string[];
  description?: string;
}

const initialGroupsData: AgentGroupMappingItem[] = [
  {
    id: 'grp-1',
    name: 'Outbound Telesales Cluster',
    agentsCount: 24,
    collections: '₹18.4 Lakh',
    campaign: 'Kalyani Kumari Recovery',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6', 'agent-7', 'agent-8'],
  },
  {
    id: 'grp-2',
    name: 'Debt Recovery Alpha',
    agentsCount: 20,
    collections: '₹34.2 Lakh',
    campaign: 'demo_npa_escalation',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-9', 'agent-10', 'agent-11', 'agent-12', 'agent-13', 'agent-14'],
  },
  {
    id: 'grp-3',
    name: 'Retention & Loyalty Desk',
    agentsCount: 12,
    collections: '₹12.8 Lakh',
    campaign: 'Moneyview_NPA_Batch3',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-15', 'agent-16', 'agent-17', 'agent-18'],
  },
  {
    id: 'grp-4',
    name: 'Customer Onboarding & Welcome',
    agentsCount: 14,
    collections: '₹8.9 Lakh',
    campaign: 'Money_new_x_p',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-19', 'agent-20', 'agent-1', 'agent-2'],
  },
  {
    id: 'grp-5',
    name: 'Critical Escalation Cell',
    agentsCount: 8,
    collections: '₹42.5 Lakh',
    campaign: 'Early_Bucket_Reminders',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-3', 'agent-4', 'agent-5', 'agent-6'],
  },
  {
    id: 'grp-6',
    name: 'Inbound Verification Helpdesk',
    agentsCount: 6,
    collections: '₹5.1 Lakh',
    campaign: '-',
    status: 'Active',
    type: 'GROUP',
    assignedAgentIds: ['agent-7', 'agent-8', 'agent-9'],
  },
];

const initialUngroupedData: AgentGroupMappingItem[] = [
  {
    id: 'ungrp-1',
    name: 'Ramesh Kumar (BN5201)',
    agentsCount: 1,
    collections: '₹2.8 Lakh',
    campaign: '-',
    status: 'Active',
    type: 'UNGROUPED',
    assignedAgentIds: ['agent-1'],
  },
  {
    id: 'ungrp-2',
    name: 'Pooja Sharma (BN5204)',
    agentsCount: 1,
    collections: '₹6.2 Lakh',
    campaign: 'Kalyani Kumari Recovery',
    status: 'Active',
    type: 'UNGROUPED',
    assignedAgentIds: ['agent-2'],
  },
  {
    id: 'ungrp-3',
    name: 'Vikram Joshi (BN5210)',
    agentsCount: 1,
    collections: '₹1.9 Lakh',
    campaign: '-',
    status: 'Active',
    type: 'UNGROUPED',
    assignedAgentIds: ['agent-3'],
  },
  {
    id: 'ungrp-4',
    name: 'Sneha Kapoor (BN5215)',
    agentsCount: 1,
    collections: '₹4.5 Lakh',
    campaign: 'demo_npa_escalation',
    status: 'Active',
    type: 'UNGROUPED',
    assignedAgentIds: ['agent-4'],
  },
];

export const MapAgentsCampaignsPage: React.FC = () => {
  const navigate = useNavigate();

  // Tabs: 'Agent Groups' | 'Ungrouped Agents'
  const [activeTab, setActiveTab] = useState<'Agent Groups' | 'Ungrouped Agents'>('Agent Groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupsList, setGroupsList] = useState<AgentGroupMappingItem[]>(initialGroupsData);
  const [ungroupedList, setUngroupedList] = useState<AgentGroupMappingItem[]>(initialUngroupedData);

  // Modals & Dialogs
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AgentGroupMappingItem | null>(null);
  const [editingUngroupedAgent, setEditingUngroupedAgent] = useState<AgentGroupMappingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Active dataset
  const currentDataset = activeTab === 'Agent Groups' ? groupsList : ungroupedList;

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return currentDataset;
    const q = searchQuery.toLowerCase();
    return currentDataset.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.collections.toLowerCase().includes(q) ||
        item.campaign.toLowerCase().includes(q)
    );
  }, [currentDataset, searchQuery]);

  // Select all logic
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((item) => item.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Assign Campaign to selected
  const handleAssignCampaigns = (campaignName: string) => {
    if (activeTab === 'Agent Groups') {
      setGroupsList((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, campaign: campaignName } : item
        )
      );
    } else {
      setUngroupedList((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id) ? { ...item, campaign: campaignName } : item
        )
      );
    }
    showToast(`Campaign assigned to ${selectedIds.length} items successfully`);
    setSelectedIds([]);
  };

  // Create Group
  const handleCreateGroup = (newGroup: AgentGroupMappingItem) => {
    setGroupsList((prev) => [newGroup, ...prev]);
    showToast(`Group "${newGroup.name}" created with ${newGroup.agentsCount} agents!`);
  };

  // Edit Group Save
  const handleEditGroupSave = (updatedGroup: AgentGroupMappingItem) => {
    setGroupsList((prev) =>
      prev.map((grp) => (grp.id === updatedGroup.id ? updatedGroup : grp))
    );
    showToast(`Group "${updatedGroup.name}" updated successfully!`);
  };

  // Delete Group
  const handleDeleteGroup = (groupId: string) => {
    const deleted = groupsList.find((g) => g.id === groupId);
    setGroupsList((prev) => prev.filter((grp) => grp.id !== groupId));
    showToast(`Group "${deleted?.name || 'Group'}" removed successfully`);
  };

  // Assign Ungrouped Agent into a group
  const handleAssignUngroupedToGroup = (
    agentItem: AgentGroupMappingItem,
    targetGroupId: string
  ) => {
    // Remove from ungrouped list
    setUngroupedList((prev) => prev.filter((u) => u.id !== agentItem.id));

    // Add to group list
    setGroupsList((prev) =>
      prev.map((grp) => {
        if (grp.id === targetGroupId) {
          const currentIds = grp.assignedAgentIds || [];
          return {
            ...grp,
            agentsCount: grp.agentsCount + 1,
            assignedAgentIds: [...currentIds, agentItem.id],
          };
        }
        return grp;
      })
    );

    const targetGroup = groupsList.find((g) => g.id === targetGroupId);
    showToast(`Added ${agentItem.name} to "${targetGroup?.name || 'Group'}"!`);
  };

  // Update Ungrouped Agent Campaign
  const handleUpdateUngroupedCampaign = (agentItemId: string, campaignName: string) => {
    setUngroupedList((prev) =>
      prev.map((item) =>
        item.id === agentItemId ? { ...item, campaign: campaignName } : item
      )
    );
    showToast('Agent campaign updated successfully!');
  };

  const handleFinishAssignment = () => {
    showToast('Agent to campaign mappings saved successfully!');
    setTimeout(() => {
      navigate('/agents');
    }, 800);
  };

  return (
    <div className="map-campaigns-root-container">
      {/* Toast */}
      {toastMessage && (
        <div className="map-campaigns-toast">
          <CheckCircle2 size={16} className="toast-success-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="map-campaigns-content-body">
        {/* 2. Page Header */}
        <div className="map-campaigns-header">
          <div className="map-header-left">
            <button
              type="button"
              className="map-back-btn"
              onClick={() => navigate('/agents')}
              title="Back to Agents"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="map-title-wrap">
              <h1 className="map-page-title">Map Agents to Campaigns</h1>
              <p className="map-page-subtitle">
                Assign agents or agent groups to campaigns. Create groups, add/remove members, and manage campaign assignments.
              </p>
            </div>
          </div>

          {/* Right Header Actions: Create Group (Just before Finish Assign) */}
          <div className="map-header-right">
            <button
              type="button"
              className="btn-create-group"
              onClick={() => setIsCreateGroupModalOpen(true)}
              title="Create a new agent group"
            >
              <UserPlus size={15} />
              <span>Create Group</span>
            </button>

            <button
              type="button"
              className="btn-finish-assignment"
              onClick={handleFinishAssignment}
            >
              Finish Assignment
            </button>
          </div>
        </div>

        {/* 3. Tabs & Toolbar Row */}
        <div className="map-tabs-toolbar-row">
          {/* Tabs Section */}
          <div className="map-tabs-container">
            <button
              type="button"
              className={`map-tab-item ${activeTab === 'Agent Groups' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('Agent Groups');
                setSelectedIds([]);
              }}
            >
              Agent Groups ({groupsList.length})
            </button>

            <button
              type="button"
              className={`map-tab-item ${activeTab === 'Ungrouped Agents' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('Ungrouped Agents');
                setSelectedIds([]);
              }}
            >
              Ungrouped Agents ({ungroupedList.length})
            </button>
          </div>

          {/* Search and Action Controls */}
          <div className="map-toolbar-controls">
            <div className="map-search-wrap">
              <Search size={14} className="map-search-icon" />
              <input
                type="text"
                className="map-search-input"
                placeholder="Search groups, campaigns, or agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-assign-campaigns"
              onClick={() => {
                if (selectedIds.length === 0) {
                  showToast('Please select at least one row to assign campaigns');
                  return;
                }
                setIsAssignModalOpen(true);
              }}
            >
              Assign Campaigns
            </button>
          </div>
        </div>

        {/* 5. Main Data Table */}
        <div className="map-table-card">
          <div className="map-table-scroll-container">
            <table className="map-data-table">
              <thead>
                <tr>
                  {/* 1. Checkbox */}
                  <th className="map-th-checkbox">
                    <input
                      type="checkbox"
                      className="map-checkbox-input"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </th>

                  {/* 2. Agent Group / Agent Name */}
                  <th className="map-th-main">
                    <div className="map-th-content">
                      <span>{activeTab === 'Agent Groups' ? 'Agent Group' : 'Agent Name'}</span>
                      <ArrowUpDown size={12} className="map-th-icon" />
                    </div>
                  </th>

                  {/* 3. Agents Count */}
                  <th className="map-th-count">
                    <div className="map-th-content">
                      <span>Agents Count</span>
                      <ArrowUpDown size={12} className="map-th-icon" />
                    </div>
                  </th>

                  {/* 4. Collections */}
                  <th className="map-th-collections">
                    <div className="map-th-content">
                      <span>Collections</span>
                      <ArrowUpDown size={12} className="map-th-icon" />
                    </div>
                  </th>

                  {/* 5. Campaign */}
                  <th className="map-th-campaign">
                    <div className="map-th-content">
                      <span>Campaign</span>
                      <ArrowUpDown size={12} className="map-th-icon" />
                    </div>
                  </th>

                  {/* 6. Action Column (Assign) */}
                  <th className="map-th-action">
                    <div className="map-th-content">
                      <span>Action</span>
                    </div>
                  </th>

                  {/* 7. Edit Column (Supervisor can edit group & add/remove agents) */}
                  <th className="map-th-edit">
                    <div className="map-th-content">
                      <span>Edit</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => {
                    const isSelected = selectedIds.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className={`map-table-row ${isSelected ? 'row-selected' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="map-td-checkbox">
                          <input
                            type="checkbox"
                            className="map-checkbox-input"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(row.id)}
                            aria-label={`Select ${row.name}`}
                          />
                        </td>

                        {/* Agent Group / Agent Name */}
                        <td className="map-td-main">
                          <div className="map-group-name-cell">
                            {row.type === 'GROUP' ? (
                              <div className="map-group-icon-avatar">
                                <Users size={14} />
                              </div>
                            ) : null}
                            <span className="map-row-title">{row.name}</span>
                          </div>
                        </td>

                        {/* Agents Count */}
                        <td className="map-td-count">
                          <span className="map-row-count">
                            {row.agentsCount} {row.agentsCount === 1 ? 'Agent' : 'Agents'}
                          </span>
                        </td>

                        {/* Collections */}
                        <td className="map-td-collections">
                          <span className="map-row-collections">{row.collections}</span>
                        </td>

                        {/* Campaign */}
                        <td className="map-td-campaign">
                          {row.campaign !== '-' && row.campaign ? (
                            <span className="map-campaign-tag">{row.campaign}</span>
                          ) : (
                            <span className="map-unassigned-tag">Unassigned</span>
                          )}
                        </td>

                        {/* Action (Assign) */}
                        <td className="map-td-action">
                          <button
                            type="button"
                            className="map-row-action-btn"
                            onClick={() => {
                              setSelectedIds([row.id]);
                              setIsAssignModalOpen(true);
                            }}
                            title="Assign Campaign"
                          >
                            Assign
                          </button>
                        </td>

                        {/* Edit Column (Edit Group / Add & Remove Agents) */}
                        <td className="map-td-edit">
                          {row.type === 'GROUP' ? (
                            <button
                              type="button"
                              className="map-row-edit-btn"
                              onClick={() => setEditingGroup(row)}
                              title={`Edit Group "${row.name}" and manage agents`}
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="map-row-edit-btn ungrouped-edit-btn"
                              onClick={() => setEditingUngroupedAgent(row)}
                              title={`Manage agent ${row.name}`}
                            >
                              <Edit2 size={12} />
                              <span>Manage</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* 6. Empty State */
                  <tr>
                    <td colSpan={7} className="map-table-empty-cell">
                      <div className="map-empty-state-wrap">
                        <Inbox size={32} className="map-empty-icon" />
                        <span className="map-empty-text">No data found</span>
                        {activeTab === 'Agent Groups' && (
                          <button
                            type="button"
                            className="btn-create-group"
                            style={{ marginTop: '0.5rem' }}
                            onClick={() => setIsCreateGroupModalOpen(true)}
                          >
                            <UserPlus size={14} />
                            <span>Create First Group</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 1. Assign Campaign Modal */}
      <AssignCampaignModal
        isOpen={isAssignModalOpen}
        selectedCount={selectedIds.length}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignCampaigns}
      />

      {/* 2. Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {/* 3. Edit Group Modal (Add/Remove Agents, Group Name, Campaign) */}
      <EditGroupModal
        isOpen={!!editingGroup}
        group={editingGroup}
        onClose={() => setEditingGroup(null)}
        onSave={handleEditGroupSave}
        onDelete={handleDeleteGroup}
      />

      {/* 4. Manage Ungrouped Agent Modal */}
      <EditUngroupedAgentModal
        isOpen={!!editingUngroupedAgent}
        agentItem={editingUngroupedAgent}
        groupsList={groupsList}
        onClose={() => setEditingUngroupedAgent(null)}
        onAssignToGroup={handleAssignUngroupedToGroup}
        onUpdateAgentCampaign={handleUpdateUngroupedCampaign}
      />
    </div>
  );
};

export default MapAgentsCampaignsPage;

