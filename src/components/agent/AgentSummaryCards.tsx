import React from 'react';

interface AgentSummaryCardsProps {
  totalAgents: number;
  onlineAgents: number;
  unallocatedAgents: number;
  nilAllocatedAgents: number;
}

export const AgentSummaryCards: React.FC<AgentSummaryCardsProps> = ({
  totalAgents,
  onlineAgents,
  unallocatedAgents,
  nilAllocatedAgents,
}) => {
  return (
    <div className="agent-summary-grid">
      <div className="agent-summary-card">
        <span className="agent-summary-label">Total Agents</span>
        <span className="agent-summary-value">{totalAgents}</span>
      </div>

      <div className="agent-summary-card">
        <span className="agent-summary-label">Online Agents</span>
        <span className="agent-summary-value">{onlineAgents}</span>
      </div>

      <div className="agent-summary-card">
        <span className="agent-summary-label">Unallocated Agents</span>
        <span className="agent-summary-value">{unallocatedAgents}</span>
      </div>

      <div className="agent-summary-card">
        <span className="agent-summary-label">Nil Allocated Agents</span>
        <span className="agent-summary-value">{nilAllocatedAgents}</span>
      </div>
    </div>
  );
};

export default AgentSummaryCards;
