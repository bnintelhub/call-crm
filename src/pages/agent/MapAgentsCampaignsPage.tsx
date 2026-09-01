import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, ArrowUpDown, ChevronDown,
  Inbox, CheckCircle2, Edit2, MoreHorizontal, Trash2
} from 'lucide-react';
import AssignCampaignModal from '../../components/agent/AssignCampaignModal';
import './MapAgentsCampaignsPage.css';

export interface AgentGroupMappingItem {
  id: string;
  name: string;
  agentsCount: number;
  collections: string;
  campaign: string;
  status?: string;
  type: 'GROUP' | 'UNGROUPED';
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
  },
  {
    id: 'grp-2',
    name: 'Debt Recovery Alpha',
    agentsCount: 20,
    collections: '₹34.2 Lakh',
    campaign: 'demo_npa_escalation',
    status: 'Active',
    type: 'GROUP',
  },
  {
    id: 'grp-3',
    name: 'Retention & Loyalty Desk',
    agentsCount: 12,
    collections: '₹12.8 Lakh',
    campaign: 'Moneyview_NPA_Batch3',
    status: 'Active',
    type: 'GROUP',
  },
  {
    id: 'grp-4',
    name: 'Customer Onboarding & Welcome',
    agentsCount: 14,
    collections: '₹8.9 Lakh',
    campaign: 'Money_new_x_p',
    status: 'Active',
    type: 'GROUP',
  },
  {
    id: 'grp-5',
    name: 'Critical Escalation Cell',
    agentsCount: 8,
    collections: '₹42.5 Lakh',
    campaign: 'Early_Bucket_Reminders',
    status: 'Active',
    type: 'GROUP',
  },
  {
    id: 'grp-6',
    name: 'Inbound Verification Helpdesk',
    agentsCount: 6,
    collections: '₹5.1 Lakh',
    campaign: '-',
    status: 'Active',
    type: 'GROUP',
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
  },
  {
    id: 'ungrp-2',
    name: 'Pooja Sharma (BN5204)',
    agentsCount: 1,
    collections: '₹6.2 Lakh',
    campaign: 'Kalyani Kumari Recovery',
    status: 'Active',
    type: 'UNGROUPED',
  },
  {
    id: 'ungrp-3',
    name: 'Vikram Joshi (BN5210)',
    agentsCount: 1,
    collections: '₹1.9 Lakh',
    campaign: '-',
    status: 'Active',
    type: 'UNGROUPED',
  },
  {
    id: 'ungrp-4',
    name: 'Sneha Kapoor (BN5215)',
    agentsCount: 1,
    collections: '₹4.5 Lakh',
    campaign: 'demo_npa_escalation',
    status: 'Active',
    type: 'UNGROUPED',
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

  // Modals & Toast
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
    showToast(`Campaign assigned to ${selectedIds.length} items`);
    setSelectedIds([]);
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
              title="Back"
            >
              <ArrowLeft size={17} />
            </button>
            <div className="map-title-wrap">
              <h1 className="map-page-title">Map Agents to Campaigns</h1>
              <p className="map-page-subtitle">
                Assign agents or agent groups to campaigns. View, edit or delete campaigns from here.
              </p>
            </div>
          </div>

          <div className="map-header-right">
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
              Agent Groups
            </button>

            <button
              type="button"
              className={`map-tab-item ${activeTab === 'Ungrouped Agents' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('Ungrouped Agents');
                setSelectedIds([]);
              }}
            >
              Ungrouped Agents
            </button>
          </div>

          {/* Search and Action Controls */}
          <div className="map-toolbar-controls">
            <div className="map-search-wrap">
              <Search size={14} className="map-search-icon" />
              <input
                type="text"
                className="map-search-input"
                placeholder="Search account number,"
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

                  {/* 2. Agent Group */}
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

                  {/* 6. Action */}
                  <th className="map-th-action">
                    <div className="map-th-content">
                      <span>Action</span>
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
                          <span className="map-row-title">{row.name}</span>
                        </td>

                        {/* Agents Count */}
                        <td className="map-td-count">
                          <span className="map-row-count">{row.agentsCount}</span>
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

                        {/* Action */}
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
                      </tr>
                    );
                  })
                ) : (
                  /* 6. Empty State: Vertically Centered "No data" */
                  <tr>
                    <td colSpan={6} className="map-table-empty-cell">
                      <div className="map-empty-state-wrap">
                        <Inbox size={32} className="map-empty-icon" />
                        <span className="map-empty-text">No data</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Campaign Modal */}
      <AssignCampaignModal
        isOpen={isAssignModalOpen}
        selectedCount={selectedIds.length}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignCampaigns}
      />
    </div>
  );
};

export default MapAgentsCampaignsPage;
