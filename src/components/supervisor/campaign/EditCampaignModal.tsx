import React from 'react';
import EditCampaignModalBase from '../../campaign/EditCampaignModal';
import type { CampaignItem } from '../../../data/campaignData';

interface EditCampaignModalProps {
  isOpen: boolean;
  campaign: CampaignItem | null;
  onClose: () => void;
  onCampaignUpdated: (updatedCamp: CampaignItem) => void;
}

export const EditCampaignModal: React.FC<EditCampaignModalProps> = (props) => {
  return <EditCampaignModalBase {...props} />;
};

export default EditCampaignModal;
