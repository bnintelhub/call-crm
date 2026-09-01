import React from 'react';

export type AllocationTabType =
  | 'All Allocations'
  | 'Unallocated'
  | '100% Allocated'
  | 'Partially Allocated'
  | 'Expiring in 5 days'
  | 'Closed';

interface AllocationTabsProps {
  activeTab: AllocationTabType;
  onTabChange: (tab: AllocationTabType) => void;
  counts?: Record<string, number>;
}

const TABS: AllocationTabType[] = [
  'All Allocations',
  'Unallocated',
  '100% Allocated',
  'Partially Allocated',
  'Expiring in 5 days',
  'Closed',
];

export const AllocationTabs: React.FC<AllocationTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="alloc-tabs-container">
      <div className="alloc-tabs-list">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = counts ? counts[tab] : undefined;

          return (
            <button
              key={tab}
              type="button"
              className={`alloc-tab-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              <span className="alloc-tab-text">{tab}</span>
              {typeof count === 'number' && (
                <span className={`alloc-tab-badge ${isActive ? 'active' : ''}`}>
                  {count}
                </span>
              )}
              {isActive && <div className="alloc-tab-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AllocationTabs;
