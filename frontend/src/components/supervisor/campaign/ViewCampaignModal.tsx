import React from 'react';
import ViewCampaignModalBase from '../../campaign/ViewCampaignModal';
import type { CampaignItem } from '../../../data/campaignData';

interface ViewCampaignModalProps {
  isOpen: boolean;
  campaign: CampaignItem | null;
  onClose: () => void;
  onEditClick: (campaign: CampaignItem) => void;
}

export const ViewCampaignModal: React.FC<ViewCampaignModalProps> = (props) => {
  return <ViewCampaignModalBase {...props} />;
};

export default ViewCampaignModal;
