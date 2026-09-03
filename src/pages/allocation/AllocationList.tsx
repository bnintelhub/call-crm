import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Layers, Upload, History, Search,
  TrendingUp, CheckCircle2, Clock, IndianRupee, Zap, Sparkles, Check
} from 'lucide-react';
import AllocationTabs, { type AllocationTabType } from '../../components/allocation/AllocationTabs';
import ActionButtons from '../../components/allocation/ActionButtons';
import AllocationTable from '../../components/allocation/AllocationTable';
import UploadModal from '../../components/allocation/UploadModal';
import UploadHistoryModal from '../../components/allocation/UploadHistoryModal';
import { type AllocationItem } from '../../data/allocationData';
import { useAllocationStore } from '../../store/allocationStore';
import { useOrgStore } from '../../store/orgStore';
import './AllocationList.css';

export const AllocationList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const { allocationsList, updateAllocation } = useAllocationStore();
  const { companyName } = useOrgStore();

  const companyAllocations = useMemo(() => {
    if (!companyName) return [];
    return allocationsList.filter(item => 
      item.allocationName.toLowerCase().startsWith(companyName.toLowerCase())
    );
  }, [allocationsList, companyName]);

  const tabQuery = (searchParams.get('tab') as AllocationTabType) || (location.state as any)?.tab;
  const initialTab: AllocationTabType =
    tabQuery && ['All Allocations', 'Unallocated', '100% Allocated', 'Partially Allocated', 'Expiring in 5 days', 'Closed'].includes(tabQuery)
      ? tabQuery
      : 'All Allocations';

  const [activeTab, setActiveTab] = useState<AllocationTabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [targetUploadItem, setTargetUploadItem] = useState<AllocationItem | null>(null);
  const [newlyAddedNotice, setNewlyAddedNotice] = useState<string | null>(
    (location.state as any)?.allocationName || null
  );

  useEffect(() => {
    if (tabQuery && ['All Allocations', 'Unallocated', '100% Allocated', 'Partially Allocated', 'Expiring in 5 days', 'Closed'].includes(tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // Auto-dismiss newly added notice after 6 seconds
  useEffect(() => {
    if (newlyAddedNotice) {
      const timer = setTimeout(() => {
        setNewlyAddedNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedNotice]);

  const handleTabChange = (tab: AllocationTabType) => {
    setActiveTab(tab);
    if (tab === 'All Allocations') {
      searchParams.delete('tab');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tab });
    }
  };

  // Tab counts dynamically calculated from store
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Allocations': companyAllocations.length,
      'Unallocated': companyAllocations.filter((a) => a.tabCategory === 'Unallocated').length,
      '100% Allocated': companyAllocations.filter((a) => a.tabCategory === '100% Allocated').length,
      'Partially Allocated': companyAllocations.filter((a) => a.tabCategory === 'Partially Allocated').length,
      'Expiring in 5 days': companyAllocations.filter((a) => a.tabCategory === 'Expiring in 5 days').length,
      'Closed': companyAllocations.filter((a) => a.tabCategory === 'Closed').length,
    };
    return counts;
  }, [companyAllocations]);

  // Dynamic stat metrics
  const stats = useMemo(() => {
    const totalLeads = companyAllocations.reduce((acc, curr) => acc + (curr.caseCounts || 0), 42000);
    const unallocatedCases = companyAllocations
      .filter((a) => a.tabCategory === 'Unallocated')
      .reduce((acc, curr) => acc + (curr.caseCounts || 0), 0);
    const fullyAllocatedCount = companyAllocations.filter((a) => a.tabCategory === '100% Allocated').length;
    const quotaPercent = companyAllocations.length > 0
      ? Math.round((fullyAllocatedCount / companyAllocations.length) * 100)
      : 100;

    return {
      totalLeads: totalLeads.toLocaleString('en-IN'),
      unallocatedCases: unallocatedCases.toLocaleString('en-IN'),
      quotaPercent: `${quotaPercent}%`,
    };
  }, [companyAllocations]);

  // Filtered allocations based on active tab and search query
  const filteredAllocations = useMemo(() => {
    return companyAllocations.filter((item) => {
      const matchesTab =
        activeTab === 'All Allocations' || item.tabCategory === activeTab;
      const matchesSearch =
        searchQuery === '' ||
        item.allocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.buckets.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, companyAllocations]);

  const handleRowUploadClick = (item: AllocationItem) => {
    setTargetUploadItem(item);
    setIsUploadModalOpen(true);
  };

  const handleUploadNewFileClick = () => {
    navigate('/allocation/upload-allocation');
  };

  const handleUploadSuccess = (fileName: string, createdItem?: AllocationItem) => {
    if (targetUploadItem) {
      updateAllocation(targetUploadItem.id, { paymentFileStatus: 'Processed' });
    } else if (createdItem) {
      setActiveTab('Unallocated');
      setSearchParams({ tab: 'Unallocated' });
      setNewlyAddedNotice(createdItem.allocationName);
    }
  };

  return (
    <div className="allocation-list-page">
      {/* 1. Page Header (Title & Action Buttons) */}
      <div className="alloc-page-header">
        <div className="alloc-title-group">
          <h1 className="alloc-page-title">
            <Layers size={26} className="alloc-title-icon" />
            Allocation list
          </h1>

          <div className="alloc-page-description">
            <span>The Allocation Summary gives you a complete view of all allocations, allocation history.</span>
            <span>You may also add and view new allocations here.</span>
          </div>
        </div>

        {/* 2. Top Right Action Buttons */}
        <ActionButtons
          onUploadHistoryClick={() => setIsUploadHistoryOpen(true)}
          onUploadNewFileClick={handleUploadNewFileClick}
        />
      </div>

      {/* 3. Summary Stat Cards (App Theme) */}
      <div className="alloc-stats-grid">
        <div className="alloc-stat-card">
          <div className="alloc-stat-icon indigo">
            <Layers size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">{stats.totalLeads}</span>
            <span className="alloc-stat-label">Total Allocated Leads</span>
          </div>
        </div>

        <div className="alloc-stat-card">
          <div className="alloc-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">{stats.quotaPercent}</span>
            <span className="alloc-stat-label">Fully Allocated Quota</span>
          </div>
        </div>

        <div className="alloc-stat-card">
          <div className="alloc-stat-icon amber">
            <Clock size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">{stats.unallocatedCases}</span>
            <span className="alloc-stat-label">Unallocated Cases</span>
          </div>
        </div>

        <div className="alloc-stat-card">
          <div className="alloc-stat-icon purple">
            <IndianRupee size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">₹1.18 Cr</span>
            <span className="alloc-stat-label">Sum of Outstanding</span>
          </div>
        </div>
      </div>

      {/* Newly Added Notice Banner */}
      {newlyAddedNotice && (
        <div className="alloc-alert-success" style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.84375rem' }}>
              Allocation file <strong>{newlyAddedNotice}</strong> has been uploaded and added to <strong>Unallocated</strong>!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNewlyAddedNotice(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Table Panel with Tabs, Search Toolbar, and Horizontal Scroll */}
      <div className="alloc-table-panel">
        <div className="alloc-table-toolbar">
          {/* Allocation Status Tabs */}
          <AllocationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />

          {/* Search Box */}
          <div className="alloc-search-box">
            <Search size={15} className="alloc-search-icon" />
            <input
              type="text"
              placeholder="Search allocation, product, bucket..."
              className="alloc-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Allocation Data Table */}
        <AllocationTable
          data={filteredAllocations}
          onUploadFileClick={handleRowUploadClick}
        />
      </div>

      {/* 5. Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setTargetUploadItem(null);
        }}
        targetItem={targetUploadItem}
        onSuccess={handleUploadSuccess}
      />

      <UploadHistoryModal
        isOpen={isUploadHistoryOpen}
        onClose={() => setIsUploadHistoryOpen(false)}
      />
    </div>
  );
};

export default AllocationList;
