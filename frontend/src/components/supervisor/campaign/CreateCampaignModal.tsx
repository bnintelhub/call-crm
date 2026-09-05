import React from 'react';
import CreateCampaignModalBase from '../../campaign/CreateCampaignModal';
import type { CampaignItem } from '../../../data/campaignData';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (newCamp: CampaignItem) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = (props) => {
  return <CreateCampaignModalBase {...props} />;
};

export default CreateCampaignModal;
