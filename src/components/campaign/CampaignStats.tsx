import React from 'react';
import { Layers, Activity, Users, Radio, UserMinus, PhoneCall } from 'lucide-react';

interface CampaignStatsProps {
  totalAgents?: number;
  onlineAgents?: number;
  unallocatedAgents?: number;
  nilAllocatedAgents?: number;
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalCompletedAutodial?: number;
}

export const CampaignStats: React.FC<CampaignStatsProps> = ({
  totalAgents = 30,
  onlineAgents = 21,
  unallocatedAgents = 4,
  nilAllocatedAgents = 0,
  totalCampaigns = 6,
  activeCampaigns = 1,
  totalCompletedAutodial = 6985,
}) => {
  const statsList = [
    {
      id: 'total-campaigns',
      label: 'Total Campaigns',
      value: totalCampaigns,
      subtext: `${activeCampaigns} active / ${totalCampaigns - activeCampaigns} paused`,
      icon: Layers,
      colorClass: 'stat-indigo',
    },
    {
      id: 'active-campaigns',
      label: 'Active Campaigns',
      value: activeCampaigns,
      subtext: 'Live dialer queues',
      icon: Activity,
      colorClass: 'stat-emerald',
      isLive: true,
    },
    {
      id: 'total-agents',
      label: 'Total Agents',
      value: totalAgents,
      subtext: 'Across all campaigns',
      icon: Users,
      colorClass: 'stat-cyan',
    },
    {
      id: 'online-agents',
      label: 'Online Agents',
      value: onlineAgents,
      subtext: `${totalAgents > 0 ? Math.round((onlineAgents / totalAgents) * 100) : 0}% logged in`,
      icon: Radio,
      colorClass: 'stat-blue',
    },
    {
      id: 'unallocated-agents',
      label: 'Unallocated Agents',
      value: unallocatedAgents,
      subtext: nilAllocatedAgents > 0 ? `${nilAllocatedAgents} nil allocated` : 'Available to allocate',
      icon: UserMinus,
      colorClass: 'stat-amber',
    },
    {
      id: 'completed-autodial',
      label: 'Completed Autodial',
      value: totalCompletedAutodial.toLocaleString(),
      subtext: 'Total automated calls',
      icon: PhoneCall,
      colorClass: 'stat-purple',
    },
  ];

  return (
    <div className="campaign-stats-grid">
      {statsList.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className={`campaign-stat-card ${stat.colorClass}`}>
            <div className="campaign-stat-top">
              <span className="campaign-stat-label">{stat.label}</span>
              <div className="campaign-stat-icon-wrap">
                <Icon size={16} className="campaign-stat-icon" />
              </div>
            </div>

            <div className="campaign-stat-main">
              <div className="campaign-stat-val-row">
                <span className="campaign-stat-value">{stat.value}</span>
                {stat.isLive && (
                  <span className="campaign-live-indicator" title="Live status">
                    <span className="live-dot-ping" />
                    <span className="live-dot-solid" />
                  </span>
                )}
              </div>
              <span className="campaign-stat-sub">{stat.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CampaignStats;
