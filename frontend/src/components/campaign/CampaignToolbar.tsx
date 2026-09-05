import React from 'react';
import { Search, Plus, X, Filter, Download } from 'lucide-react';
import CampaignCategoryTabs, { type CampaignCategoryTab } from './CampaignCategoryTabs';

interface CampaignToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeCategory: CampaignCategoryTab;
  onCategoryChange: (cat: CampaignCategoryTab) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryCounts: {
    all: number;
    predictive: number;
    progressive: number;
    manual: number;
    preview: number;
  };
  totalResults: number;
  onCreateClick: () => void;
  onExportClick: () => void;
}

export const CampaignToolbar: React.FC<CampaignToolbarProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
  categoryCounts,
  totalResults,
  onCreateClick,
  onExportClick,
}) => {
  return (
    <div className="campaign-toolbar-container">
      {/* Category Tabs */}
      <div className="campaign-toolbar-top-row">
        <CampaignCategoryTabs
          activeTab={activeCategory}
          onTabChange={onCategoryChange}
          counts={categoryCounts}
        />

        {/* Action Buttons (Export & Create) */}
        <div className="campaign-top-actions">
          <button
            type="button"
            className="btn-camp-export"
            onClick={onExportClick}
            title="Export campaigns to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-camp-create-primary"
            onClick={onCreateClick}
          >
            <Plus size={15} />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="campaign-toolbar-filter-row">
        <div className="campaign-search-box-wrap">
          <Search size={15} className="campaign-search-icon" />
          <input
            type="text"
            className="campaign-search-input-field"
            placeholder="Search by campaign name, queue, or strategy..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="campaign-search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="campaign-filter-controls">
          {/* Status Dropdown */}
          <div className="campaign-select-wrap">
            <Filter size={13} className="select-icon" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="campaign-status-select"
            >
              <option value="ALL">All Status</option>
              <option value="Running">Running</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="campaign-results-pill">
            <span className="results-count-number">{totalResults}</span>
            <span className="results-count-label">campaigns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignToolbar;
