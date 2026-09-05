import React from 'react';
import CampaignToolbarBase from '../../campaign/CampaignToolbar';
import type { CampaignCategoryTab } from '../../campaign/CampaignCategoryTabs';

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

export const CampaignToolbar: React.FC<CampaignToolbarProps> = (props) => {
  return <CampaignToolbarBase {...props} />;
};

export default CampaignToolbar;
