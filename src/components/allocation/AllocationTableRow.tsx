import React from 'react';
import type { AllocationItem } from '../../data/allocationData';
import AllocationStatusBadge from './AllocationStatusBadge';

interface AllocationTableRowProps {
  item: AllocationItem;
  onUploadFileClick: (item: AllocationItem) => void;
}

export const AllocationTableRow: React.FC<AllocationTableRowProps> = ({
  item,
  onUploadFileClick,
}) => {
  return (
    <tr className="alloc-table-row">
      {/* 1. Allocation name */}
      <td className="alloc-cell-name">
        <span className="alloc-name-text" title={item.allocationName}>
          {item.allocationName}
        </span>
      </td>

      {/* 2. Product */}
      <td className="alloc-cell-product">
        <span>{item.product}</span>
      </td>

      {/* 3. Buckets */}
      <td className="alloc-cell-bucket">
        <span className="alloc-bucket-pill">{item.buckets}</span>
      </td>

      {/* 4. Case counts */}
      <td className="alloc-cell-number">
        <span>{item.caseCounts.toLocaleString()}</span>
      </td>

      {/* 5. DND */}
      <td className="alloc-cell-number">
        <span>{item.dnd}</span>
      </td>

      {/* 6. Sum of Outstanding */}
      <td className="alloc-cell-amount">
        <span className="alloc-amount-val">{item.sumOfOutstanding}</span>
      </td>

      {/* 7. Created On */}
      <td className="alloc-cell-date">
        <span>{item.createdOn}</span>
      </td>

      {/* 8. Allocation Status */}
      <td className="alloc-cell-status">
        <AllocationStatusBadge status={item.allocationStatus} />
      </td>

      {/* 9. Collection % */}
      <td className="alloc-cell-percent">
        <span>{item.collectionPercent}</span>
      </td>

      {/* 10. Payment file status */}
      <td className="alloc-cell-action">
        {item.paymentFileStatus === 'Upload File' ? (
          <button
            type="button"
            className="alloc-upload-action-btn"
            onClick={() => onUploadFileClick(item)}
          >
            Upload File
          </button>
        ) : (
          <span className="alloc-file-processed">
            {item.paymentFileStatus}
          </span>
        )}
      </td>
    </tr>
  );
};

export default AllocationTableRow;
