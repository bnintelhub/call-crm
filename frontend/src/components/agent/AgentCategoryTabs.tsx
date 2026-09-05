import React from 'react';

export type AgentTabType = 'ALL' | 'FIELD' | 'CALL';

interface AgentCategoryTabsProps {
  activeTab: AgentTabType;
  onTabChange: (tab: AgentTabType) => void;
  allCount: number;
  fieldCount: number;
  callCount: number;
}

export const AgentCategoryTabs: React.FC<AgentCategoryTabsProps> = ({
  activeTab,
  onTabChange,
  allCount,
  fieldCount,
  callCount,
}) => {
  return (
    <div className="agent-tabs-container">
      <div className="agent-tabs-list">
        <button
          type="button"
          className={`agent-tab-item ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => onTabChange('ALL')}
        >
          <span className="agent-tab-label">All Agents</span>
          <span className="agent-tab-count">{allCount}</span>
          {activeTab === 'ALL' && <div className="agent-tab-indicator" />}
        </button>

        <button
          type="button"
          className={`agent-tab-item ${activeTab === 'FIELD' ? 'active' : ''}`}
          onClick={() => onTabChange('FIELD')}
        >
          <span className="agent-tab-label">Field Agents</span>
          {fieldCount > 0 && <span className="agent-tab-count">{fieldCount}</span>}
          {activeTab === 'FIELD' && <div className="agent-tab-indicator" />}
        </button>

        <button
          type="button"
          className={`agent-tab-item ${activeTab === 'CALL' ? 'active' : ''}`}
          onClick={() => onTabChange('CALL')}
        >
          <span className="agent-tab-label">Call Agents</span>
          <span className="agent-tab-count">{callCount}</span>
          {activeTab === 'CALL' && <div className="agent-tab-indicator" />}
        </button>
      </div>
    </div>
  );
};

export default AgentCategoryTabs;
