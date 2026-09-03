import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, ArrowLeft, Plus, Download, RotateCw, CheckCircle2 } from 'lucide-react';
import { initialCampaignsData, type CampaignItem } from '../../data/campaignData';
import CampaignStats from '../../components/campaign/CampaignStats';
import CampaignToolbar from '../../components/campaign/CampaignToolbar';
import CampaignTable from '../../components/campaign/CampaignTable';
import CreateCampaignModal from '../../components/campaign/CreateCampaignModal';
import EditCampaignModal from '../../components/campaign/EditCampaignModal';
import ViewCampaignModal from '../../components/campaign/ViewCampaignModal';
import type { CampaignCategoryTab } from '../../components/campaign/CampaignCategoryTabs';
import './CampaignPage.css';

export const CampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>(initialCampaignsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CampaignCategoryTab>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingCampaign, setViewingCampaign] = useState<CampaignItem | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Stats calculation
  const totalCampaigns = campaignsList.length;
  const activeCampaigns = campaignsList.filter((c) => c.status === 'Running').length;
  const totalAgents = campaignsList.reduce((acc, c) => acc + (c.agentsCount || 0), 0);
  const onlineAgents = Math.round(totalAgents * 0.7);
  const totalCompletedAutodial = campaignsList.reduce((acc, c) => acc + (c.completedAutodial || 0), 0);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: campaignsList.length,
      predictive: campaignsList.filter((c) => c.category === 'PREDICTIVE').length,
      progressive: campaignsList.filter((c) => c.category === 'PROGRESSIVE').length,
      manual: campaignsList.filter((c) => c.category === 'MANUAL').length,
      preview: campaignsList.filter((c) => c.category === 'PREVIEW').length,
    };
  }, [campaignsList]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaignsList.filter((campaign) => {
      // 1. Category Filter
      if (activeCategory !== 'ALL' && campaign.category !== activeCategory) {
        return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL' && campaign.status !== statusFilter) {
        return false;
      }

      // 3. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        campaign.name.toLowerCase().includes(q) ||
        campaign.category.toLowerCase().includes(q) ||
        (campaign.targetQueue && campaign.targetQueue.toLowerCase().includes(q)) ||
        (campaign.strategy && campaign.strategy.toLowerCase().includes(q))
      );
    });
  }, [campaignsList, activeCategory, statusFilter, searchQuery]);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Campaign data synchronized successfully');
    }, 600);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Campaign ID',
      'Campaign Name',
      'Dialing Mode',
      'Target Queue',
      'Strategy',
      'Borrower Count',
      'Left Out Borrower',
      'Contactability (%)',
      'Assigned Agents',
      'Completed Autodial',
      'Status',
      'Created Date',
    ];

    const rows = filteredCampaigns.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.category}"`,
      `"${c.targetQueue || '-'}"`,
      `"${c.strategy || '-'}"`,
      c.borrowerCount,
      c.leftOutBorrower,
      `"${c.contactability}%"`,
      c.agentsCount,
      c.completedAutodial,
      `"${c.status}"`,
      `"${c.createdAt || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campaigns_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredCampaigns.length} campaigns to CSV`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('ALL');
    setStatusFilter('ALL');
  };

  // Add Created Campaign
  const handleCampaignCreated = (newCamp: CampaignItem) => {
    setCampaignsList((prev) => [newCamp, ...prev]);
    showToast(`Campaign "${newCamp.name}" created successfully`);
  };

  // Update Edited Campaign
  const handleCampaignUpdated = (updatedCamp: CampaignItem) => {
    setCampaignsList((prev) =>
      prev.map((c) => (c.id === updatedCamp.id ? updatedCamp : c))
    );
    showToast(`Campaign "${updatedCamp.name}" updated`);
  };

  // Row / Menu Actions
  const handleAction = (
    action: 'view' | 'edit' | 'delete' | 'duplicate' | 'toggleStatus',
    campaign: CampaignItem
  ) => {
    if (action === 'view') {
      setViewingCampaign(campaign);
    } else if (action === 'edit') {
      setEditingCampaign(campaign);
    } else if (action === 'toggleStatus') {
      const nextStatus = campaign.status === 'Running' ? 'Paused' : 'Running';
      setCampaignsList((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: nextStatus } : c))
      );
      showToast(`Campaign "${campaign.name}" set to ${nextStatus}`);
    } else if (action === 'duplicate') {
      const duplicated: CampaignItem = {
        ...campaign,
        id: `camp-${Date.now()}`,
        name: `${campaign.name} (Copy)`,
        status: 'Paused',
        completedAutodial: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCampaignsList((prev) => [duplicated, ...prev]);
      showToast(`Duplicated campaign as "${duplicated.name}"`);
    } else if (action === 'delete') {
      setCampaignsList((prev) => prev.filter((c) => c.id !== campaign.id));
      showToast(`Deleted campaign "${campaign.name}"`);
    }
  };

  return (
    <div className="campaign-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="campaign-toast">
          <CheckCircle2 size={16} className="toast-icon-check" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Page Header Row */}
      <div className="campaign-header-row">
        <div className="campaign-title-group">
          <button
            type="button"
            className="campaign-back-btn"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="campaign-title-icon-box">
            <Megaphone size={20} className="header-icon-gradient" />
          </div>
          <div className="campaign-heading-texts">
            <h1 className="campaign-title-text">Campaign Management</h1>
            <p className="campaign-subtitle-text">
              Create, configure, and monitor automated dialer campaigns, agent allocations, and live call distribution.
            </p>
          </div>
        </div>

        <div className="campaign-header-actions">
          <button
            type="button"
            className={`btn-camp-header-outline ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            title="Refresh Campaign Metrics"
          >
            <RotateCw size={15} className={`header-btn-icon ${isRefreshing ? 'spin-anim' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn-camp-header-outline"
            onClick={handleExportCSV}
            title="Export CSV"
          >
            <Download size={15} className="header-btn-icon" />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="btn-camp-header-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* 3. Statistics Cards (6 Themed Interactive Metric Cards) */}
      <CampaignStats
        totalCampaigns={totalCampaigns}
        activeCampaigns={activeCampaigns}
        totalAgents={totalAgents}
        onlineAgents={onlineAgents}
        unallocatedAgents={4}
        nilAllocatedAgents={0}
        totalCompletedAutodial={totalCompletedAutodial}
      />

      {/* 4. Category Tabs + Search + Filter Controls */}
      <CampaignToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryCounts={categoryCounts}
        totalResults={filteredCampaigns.length}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onExportClick={handleExportCSV}
      />

      {/* 5. Campaign Data Table */}
      <CampaignTable
        campaigns={filteredCampaigns}
        onAction={handleAction}
      />

      {/* 6. Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCampaignCreated={handleCampaignCreated}
      />

      <EditCampaignModal
        isOpen={Boolean(editingCampaign)}
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onCampaignUpdated={handleCampaignUpdated}
      />

      <ViewCampaignModal
        isOpen={Boolean(viewingCampaign)}
        campaign={viewingCampaign}
        onClose={() => setViewingCampaign(null)}
        onEditClick={(camp) => setEditingCampaign(camp)}
      />
    </div>
  );
};

export default CampaignPage;
