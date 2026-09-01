import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search, Share2, Download, CheckCircle2 } from 'lucide-react';
import { type AgentItem } from '../../data/agentMockData';
import { useAgentStore } from '../../store/agentStore';
import AgentSummaryCards from '../../components/agent/AgentSummaryCards';
import AgentCategoryTabs, { type AgentTabType } from '../../components/agent/AgentCategoryTabs';
import AgentTable from '../../components/agent/AgentTable';
import OnboardAgentModal from '../../components/agent/OnboardAgentModal';
import ShareInviteModal from '../../components/agent/ShareInviteModal';
import './AgentListPage.css';

export const AgentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { agentsList, deleteAgent, lastAddedAgentId } = useAgentStore();
  const [activeTab, setActiveTab] = useState<AgentTabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newlyAddedAgent, setNewlyAddedAgent] = useState<AgentItem | null>(null);

  // Auto-dismiss newly added notice
  useEffect(() => {
    if (newlyAddedAgent) {
      const timer = setTimeout(() => setNewlyAddedAgent(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedAgent]);

  // Tab counts
  const allCount = agentsList.length;
  const fieldCount = agentsList.filter((a) => a.type === 'FIELD').length;
  const callCount = agentsList.filter((a) => a.type === 'CALL').length;

  // Dynamic summary stats
  const onlineAgentsCount = agentsList.filter((a) => a.isOnline).length;
  const unallocatedAgentsCount = agentsList.filter((a) => !a.isAllocated).length;
  const nilAllocatedCount = agentsList.filter((a) => a.campaign === '-' || !a.campaign).length;

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agentsList.filter((agent) => {
      // Category filter
      if (activeTab === 'FIELD' && agent.type !== 'FIELD') return false;
      if (activeTab === 'CALL' && agent.type !== 'CALL') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        agent.agentName.toLowerCase().includes(q) ||
        agent.supervisor.toLowerCase().includes(q) ||
        agent.bnId.toLowerCase().includes(q) ||
        agent.area.toLowerCase().includes(q) ||
        agent.basePincode.includes(q) ||
        agent.residencePincode.includes(q) ||
        agent.currentAddress.toLowerCase().includes(q) ||
        agent.permanentAddress.toLowerCase().includes(q) ||
        agent.experience.toLowerCase().includes(q) ||
        agent.campaign.toLowerCase().includes(q)
      );
    });
  }, [agentsList, activeTab, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Agent Name',
      'Supervisor',
      'BN Associates ID',
      'DRA',
      'Area',
      'Base Pincode',
      'Residence Pincode',
      'Current Address',
      'Permanent Address',
      'Experience',
      'Campaign',
      'ACR',
      'Role Type',
    ];

    const rows = filteredAgents.map((a) => [
      `"${a.agentName}"`,
      `"${a.supervisor}"`,
      `"${a.bnId}"`,
      `"${a.dra}"`,
      `"${a.area}"`,
      `"${a.basePincode}"`,
      `"${a.residencePincode}"`,
      `"${a.currentAddress}"`,
      `"${a.permanentAddress}"`,
      `"${a.experience}"`,
      `"${a.campaign}"`,
      `"${a.acr}"`,
      `"${a.type}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agents_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAgentAdded = (newAgent: AgentItem) => {
    setNewlyAddedAgent(newAgent);
  };

  const handleRowAction = (action: string, agent: AgentItem) => {
    if (action === 'deactivate') {
      deleteAgent(agent.id);
    } else {
      console.log(`Action: ${action} for agent:`, agent);
    }
  };

  return (
    <div className="agent-list-page">
      {/* 1. Page Header */}
      <div className="agent-page-header">
        <div className="agent-title-block">
          <div className="agent-title-row">
            <button
              type="button"
              className="agent-back-btn"
              onClick={() => navigate('/dashboard')}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="agent-page-title">Agents List</h1>
          </div>
          <p className="agent-page-subtitle">
            You can view, add and assign agents to campaigns here.
          </p>
        </div>

        <button
          type="button"
          className="btn-onboard-agent"
          onClick={() => setIsOnboardModalOpen(true)}
        >
          <UserPlus size={16} />
          <span>Onboard Agents</span>
        </button>
      </div>

      {/* Success Alert Banner for Newly Onboarded Agent */}
      {newlyAddedAgent && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.84375rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle2 size={18} />
            <span>
              Agent <strong>{newlyAddedAgent.agentName}</strong> (ID: <strong>{newlyAddedAgent.bnId}</strong>) was onboarded successfully!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewlyAddedAgent(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Agent Summary Section (4 Horizontal Boxes) */}
      <AgentSummaryCards
        totalAgents={agentsList.length}
        onlineAgents={onlineAgentsCount}
        unallocatedAgents={unallocatedAgentsCount}
        nilAllocatedAgents={nilAllocatedCount}
      />

      {/* 3. Agent Category Tabs */}
      <AgentCategoryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        allCount={allCount}
        fieldCount={fieldCount}
        callCount={callCount}
      />

      {/* 4. Search & Actions Toolbar */}
      <div className="agent-table-toolbar">
        <div className="agent-search-box">
          <Search size={16} className="agent-search-icon" />
          <input
            type="text"
            placeholder="Search account number, agent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="agent-search-input"
          />
        </div>

        <div className="agent-toolbar-actions">
          <button
            type="button"
            className="btn-share-invite"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2 size={15} />
            <span>Share App Invite</span>
          </button>

          <button
            type="button"
            className="btn-export-icon"
            onClick={handleExportCSV}
            title="Download Agents CSV"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 5. Agent Data Table */}
      <AgentTable
        agents={filteredAgents}
        onActionClick={handleRowAction}
      />

      {/* Onboard Agent Modal */}
      <OnboardAgentModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onAgentAdded={handleAgentAdded}
      />

      {/* Share Invite Modal */}
      <ShareInviteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default AgentListPage;
