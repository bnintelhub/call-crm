import React from 'react';

interface AllocationStatusBadgeProps {
  status: 'Fully allocated' | 'Partially allocated' | 'Unallocated' | 'Closed' | string;
}

export const AllocationStatusBadge: React.FC<AllocationStatusBadgeProps> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case 'Fully allocated':
        return 'alloc-badge-fully';
      case 'Partially allocated':
        return 'alloc-badge-partial';
      case 'Unallocated':
        return 'alloc-badge-unallocated';
      case 'Closed':
        return 'alloc-badge-closed';
      default:
        return 'alloc-badge-default';
    }
  };

  return (
    <span className={`alloc-status-badge ${getBadgeClass()}`}>
      {status}
    </span>
  );
};

export default AllocationStatusBadge;
