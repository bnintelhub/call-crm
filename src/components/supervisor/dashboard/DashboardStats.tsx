import React from 'react';
import { Users, PhoneCall, IndianRupee, TrendingUp } from 'lucide-react';
import { formatINR } from '../../../utils/helpers';

interface DashboardStatsProps {
  totalAllocations?: number;
  totalCollected?: number;
  activeAgents?: number;
  ptpRate?: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalAllocations = 3450,
  totalCollected = 1845000,
  activeAgents = 28,
  ptpRate = 74.2,
}) => {
  return (
    <div className="agent-summary-grid">
      <div className="agent-summary-card">
        <span className="agent-summary-label">Total Leads In Pipeline</span>
        <span className="agent-summary-value">{totalAllocations.toLocaleString('en-IN')}</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Total Collections Recovered</span>
        <span className="agent-summary-value">{formatINR(totalCollected, true)}</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">Active Agents Online</span>
        <span className="agent-summary-value">{activeAgents}</span>
      </div>
      <div className="agent-summary-card">
        <span className="agent-summary-label">PTP Resolution Rate</span>
        <span className="agent-summary-value">{ptpRate}%</span>
      </div>
    </div>
  );
};

export default DashboardStats;
