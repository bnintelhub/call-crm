import React from 'react';
import UploadModal from '../../allocation/UploadModal';
import type { AllocationItem } from '../../../data/allocationData';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: AllocationItem | null;
  onSuccess?: (fileName: string, createdItem?: AllocationItem) => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = (props) => {
  return <UploadModal {...props} />;
};

export default AllocationModal;
