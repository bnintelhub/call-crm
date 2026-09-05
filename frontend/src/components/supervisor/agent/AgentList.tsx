import React from 'react';
import { AgentTable } from '../../agent/AgentTable';
import { AgentCategoryTabs, type AgentTabType } from '../../agent/AgentCategoryTabs';
import type { AgentItem } from '../../../types';

interface AgentListProps {
  agents: AgentItem[];
  activeTab: AgentTabType;
  onTabChange: (tab: AgentTabType) => void;
  allCount: number;
  fieldCount: number;
  callCount: number;
  onActionClick?: (action: string, agent: AgentItem) => void;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  activeTab,
  onTabChange,
  allCount,
  fieldCount,
  callCount,
  onActionClick,
}) => {
  return (
    <div>
      <AgentCategoryTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        allCount={allCount}
        fieldCount={fieldCount}
        callCount={callCount}
      />
      <AgentTable agents={agents} onActionClick={onActionClick} />
    </div>
  );
};

export default AgentList;
