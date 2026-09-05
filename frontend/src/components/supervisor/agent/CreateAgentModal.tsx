import React from 'react';
import OnboardAgentModal from '../../agent/OnboardAgentModal';
import type { AgentItem } from '../../../types';

export interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentAdded?: (newAgent: AgentItem) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = (props) => {
  return <OnboardAgentModal {...props} />;
};

export default CreateAgentModal;
