import React from 'react';
import { Layers, Zap, Sliders, PlayCircle, Eye } from 'lucide-react';

export type CampaignCategoryTab = 'ALL' | 'PREDICTIVE' | 'PROGRESSIVE' | 'MANUAL' | 'PREVIEW';

interface CampaignCategoryTabsProps {
  activeTab: CampaignCategoryTab;
  onTabChange: (tab: CampaignCategoryTab) => void;
  counts: {
    all: number;
    predictive: number;
    progressive: number;
    manual: number;
    preview: number;
  };
}

export const CampaignCategoryTabs: React.FC<CampaignCategoryTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    { id: 'ALL' as CampaignCategoryTab, label: 'All Modes', count: counts.all, icon: Layers },
    { id: 'PREDICTIVE' as CampaignCategoryTab, label: 'Predictive', count: counts.predictive, icon: Zap },
    { id: 'PROGRESSIVE' as CampaignCategoryTab, label: 'Progressive', count: counts.progressive, icon: PlayCircle },
    { id: 'MANUAL' as CampaignCategoryTab, label: 'Manual', count: counts.manual, icon: Sliders },
    { id: 'PREVIEW' as CampaignCategoryTab, label: 'Preview', count: counts.preview, icon: Eye },
  ];

  return (
    <div className="campaign-category-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`campaign-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={14} className="tab-icon" />
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count-badge">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CampaignCategoryTabs;
