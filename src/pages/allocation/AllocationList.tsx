import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers, Upload, History, Search, ChevronRight,
  TrendingUp, CheckCircle2, Clock, IndianRupee, Zap, Sparkles
} from 'lucide-react';
import AllocationTabs, { type AllocationTabType } from '../../components/allocation/AllocationTabs';
import ActionButtons from '../../components/allocation/ActionButtons';
import AllocationTable from '../../components/allocation/AllocationTable';
import FloatingSupport from '../../components/allocation/FloatingSupport';
import UploadModal from '../../components/allocation/UploadModal';
import UploadHistoryModal from '../../components/allocation/UploadHistoryModal';
import { mockAllocations, type AllocationItem } from '../../data/allocationData';
import './AllocationList.css';

export const AllocationList: React.FC = () => {
  const navigate = useNavigate();
  const [allocationsList, setAllocationsList] = useState<AllocationItem[]>(mockAllocations);
  const [activeTab, setActiveTab] = useState<AllocationTabType>('All Allocations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadHistoryOpen, setIsUploadHistoryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [targetUploadItem, setTargetUploadItem] = useState<AllocationItem | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Allocations': allocationsList.length,
      'Unallocated': allocationsList.filter((a) => a.tabCategory === 'Unallocated').length,
      '100% Allocated': allocationsList.filter((a) => a.tabCategory === '100% Allocated').length,
      'Partially Allocated': allocationsList.filter((a) => a.tabCategory === 'Partially Allocated').length,
      'Expiring in 5 days': allocationsList.filter((a) => a.tabCategory === 'Expiring in 5 days').length,
      'Closed': allocationsList.filter((a) => a.tabCategory === 'Closed').length,
    };
    return counts;
  }, [allocationsList]);

  // Filtered allocations based on active tab and search query
  const filteredAllocations = useMemo(() => {
    return allocationsList.filter((item) => {
      const matchesTab =
        activeTab === 'All Allocations' || item.tabCategory === activeTab;
      const matchesSearch =
        searchQuery === '' ||
        item.allocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.buckets.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, allocationsList]);

  const handleRowUploadClick = (item: AllocationItem) => {
    setTargetUploadItem(item);
    setIsUploadModalOpen(true);
  };

  const handleUploadNewFileClick = () => {
    navigate('/allocation/upload-allocation');
  };

  const handleUploadSuccess = (fileName: string) => {
    if (targetUploadItem) {
      setAllocationsList((prev) =>
        prev.map((item) =>
          item.id === targetUploadItem.id
            ? { ...item, paymentFileStatus: 'Processed' }
            : item
        )
      );
    } else {
      const newBatch: AllocationItem = {
        id: `alloc-${Date.now()}`,
        allocationName: `Moneyview_Personal Loan_Fresh_${new Date().toISOString().slice(0, 10)}_${new Date().toTimeString().slice(0, 5)}`,
        product: 'Personal Loan',
        buckets: 'Fresh',
        caseCounts: Math.floor(Math.random() * 400) + 50,
        dnd: 0,
        sumOfOutstanding: `₹${(Math.random() * 20 + 5).toFixed(1)} Lakh`,
        createdOn: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${new Date().toTimeString().slice(0, 5)}`,
        allocationStatus: 'Fully allocated',
        collectionPercent: '0.00%',
        paymentFileStatus: 'Upload File',
        tabCategory: '100% Allocated',
      };
      setAllocationsList((prev) => [newBatch, ...prev]);
    }
  };

  return (
    <div className="allocation-list-page">
      {/* 1. Page Header (Breadcrumbs, Title & Action Buttons) */}
      <div className="alloc-page-header">
        <div className="alloc-title-group">
          <div className="alloc-breadcrumbs">
            <Link to="/dashboard">Dashboard</Link>
            <ChevronRight size={14} />
            <span>IVR Call</span>
            <ChevronRight size={14} />
            <span className="alloc-breadcrumbs-current">Allocation List</span>
          </div>

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
            <span className="alloc-stat-value">45,280</span>
            <span className="alloc-stat-label">Total Allocated Leads</span>
          </div>
        </div>

        <div className="alloc-stat-card">
          <div className="alloc-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">100%</span>
            <span className="alloc-stat-label">Fully Allocated Quota</span>
          </div>
        </div>

        <div className="alloc-stat-card">
          <div className="alloc-stat-icon amber">
            <Clock size={22} />
          </div>
          <div className="alloc-stat-info">
            <span className="alloc-stat-value">620</span>
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

      {/* 4. Table Panel with Tabs, Search Toolbar, and Horizontal Scroll */}
      <div className="alloc-table-panel">
        <div className="alloc-table-toolbar">
          {/* Allocation Status Tabs */}
          <AllocationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
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
