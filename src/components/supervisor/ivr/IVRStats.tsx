import React from 'react';
import { PhoneCall, Headphones, Clock, CheckCircle2 } from 'lucide-react';

interface IVRStatsProps {
  totalCalls?: number;
  connectedRate?: number;
  avgDurationSec?: number;
  activeAgentsCount?: number;
}

export const IVRStats: React.FC<IVRStatsProps> = ({
  totalCalls = 1845,
  connectedRate = 68.4,
  avgDurationSec = 135,
  activeAgentsCount = 24,
}) => {
  return (
    <div className="agent-summary-grid" style={{ marginBottom: '1.25rem' }}>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Total Outbound Calls</span>
        <span className="agent-summary-value">{totalCalls.toLocaleString('en-IN')}</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Connect Ratio</span>
        <span className="agent-summary-value">{connectedRate}%</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Avg Handle Time</span>
        <span className="agent-summary-value">{Math.floor(avgDurationSec / 60)}m {avgDurationSec % 60}s</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Active Agents Online</span>
        <span className="agent-summary-value">{activeAgentsCount}</span>
      </div>
    </div>
  );
};

export default IVRStats;
