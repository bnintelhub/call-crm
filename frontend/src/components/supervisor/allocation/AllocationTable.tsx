import React from 'react';
import AllocationTableBase from '../../allocation/AllocationTable';
import type { AllocationItem } from '../../../data/allocationData';

interface AllocationTableProps {
  data: AllocationItem[];
  onUploadFileClick: (item: AllocationItem) => void;
}

export const AllocationTable: React.FC<AllocationTableProps> = (props) => {
  return <AllocationTableBase {...props} />;
};

export default AllocationTable;
