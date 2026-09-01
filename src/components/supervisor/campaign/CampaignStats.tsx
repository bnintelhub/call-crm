import React from 'react';
import CampaignStatsBase from '../../campaign/CampaignStats';

interface CampaignStatsProps {
  totalCampaigns: number;
  liveCampaigns: number;
  assignedCampaigns: number;
  totalAllocations: number;
}

export const CampaignStats: React.FC<CampaignStatsProps> = (props) => {
  return <CampaignStatsBase {...props} />;
};

export default CampaignStats;
