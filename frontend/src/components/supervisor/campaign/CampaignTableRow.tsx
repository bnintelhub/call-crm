import React from 'react';
import CampaignTableRowBase from '../../campaign/CampaignTableRow';
import type { CampaignItem } from '../../../data/campaignData';

interface CampaignTableRowProps {
  campaign: CampaignItem;
  onAction: (action: 'view' | 'edit' | 'delete', campaign: CampaignItem) => void;
}

export const CampaignTableRow: React.FC<CampaignTableRowProps> = (props) => {
  return <CampaignTableRowBase {...props} />;
};

export default CampaignTableRow;
