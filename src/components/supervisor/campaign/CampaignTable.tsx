import React from 'react';
import CampaignTableBase from '../../campaign/CampaignTable';
import type { CampaignItem } from '../../../data/campaignData';

interface CampaignTableProps {
  campaigns: CampaignItem[];
  onAction: (action: 'view' | 'edit' | 'delete', campaign: CampaignItem) => void;
}

export const CampaignTable: React.FC<CampaignTableProps> = (props) => {
  return <CampaignTableBase {...props} />;
};

export default CampaignTable;
