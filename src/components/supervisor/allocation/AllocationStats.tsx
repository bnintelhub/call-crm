import React from 'react';
import { Layers, CheckCircle2, Clock, IndianRupee } from 'lucide-react';
import { formatINR } from '../../../utils/helpers';

interface AllocationStatsProps {
  totalLeads: number;
  allocatedLeads: number;
  unallocatedCount: number;
  quotaPercent: number;
}

export const AllocationStats: React.FC<AllocationStatsProps> = ({
  totalLeads,
  allocatedLeads,
  unallocatedCount,
  quotaPercent,
}) => {
  return (
    <div className="alloc-stats-grid">
      <div className="alloc-stat-card">
        <div className="alloc-stat-icon indigo">
          <Layers size={22} />
        </div>
        <div className="alloc-stat-data">
          <span className="alloc-stat-title">Total Leads</span>
          <span className="alloc-stat-value">{totalLeads.toLocaleString('en-IN')}</span>
          <span className="alloc-stat-sub">Across all batches</span>
        </div>
      </div>

      <div className="alloc-stat-card">
        <div className="alloc-stat-icon emerald">
          <CheckCircle2 size={22} />
        </div>
        <div className="alloc-stat-data">
          <span className="alloc-stat-title">Allocated Rate</span>
          <span className="alloc-stat-value">{quotaPercent}%</span>
          <span className="alloc-stat-sub">{allocatedLeads.toLocaleString('en-IN')} assigned</span>
        </div>
      </div>

      <div className="alloc-stat-card">
        <div className="alloc-stat-icon amber">
          <Clock size={22} />
        </div>
        <div className="alloc-stat-data">
          <span className="alloc-stat-title">Unallocated Cases</span>
          <span className="alloc-stat-value">{unallocatedCount.toLocaleString('en-IN')}</span>
          <span className="alloc-stat-sub">Ready for assignment</span>
        </div>
      </div>

      <div className="alloc-stat-card">
        <div className="alloc-stat-icon purple">
          <IndianRupee size={22} />
        </div>
        <div className="alloc-stat-data">
          <span className="alloc-stat-title">Total Portfolio POS</span>
          <span className="alloc-stat-value">{formatINR(totalLeads * 14500, true)}</span>
          <span className="alloc-stat-sub">Estimated book value</span>
        </div>
      </div>
    </div>
  );
};

export default AllocationStats;
