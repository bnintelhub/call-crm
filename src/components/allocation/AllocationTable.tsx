import React, { useState } from 'react';
import type { AllocationItem } from '../../data/allocationData';
import AllocationTableRow from './AllocationTableRow';
import { ArrowUpDown, Filter } from 'lucide-react';

interface AllocationTableProps {
  data: AllocationItem[];
  onUploadFileClick: (item: AllocationItem) => void;
}

type SortField = 'allocationName' | 'createdOn' | 'caseCounts' | 'sumOfOutstanding' | 'collectionPercent';

export const AllocationTable: React.FC<AllocationTableProps> = ({
  data,
  onUploadFileClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('createdOn');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'caseCounts') {
      comparison = a.caseCounts - b.caseCounts;
    } else if (sortField === 'allocationName') {
      comparison = a.allocationName.localeCompare(b.allocationName);
    } else if (sortField === 'createdOn') {
      comparison = a.createdOn.localeCompare(b.createdOn);
    } else if (sortField === 'collectionPercent') {
      comparison = parseFloat(a.collectionPercent) - parseFloat(b.collectionPercent);
    }
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="alloc-table-container">
      <div className="alloc-table-scroll-wrapper">
        <table className="alloc-data-table">
          <thead>
            <tr>
              <th className="th-alloc-name" onClick={() => handleSort('allocationName')}>
                <div className="th-content">
                  <span>Allocation name</span>
                  <ArrowUpDown size={13} className="th-sort-icon" />
                </div>
              </th>

              <th className="th-product">
                <div className="th-content">
                  <span>Product</span>
                </div>
              </th>

              <th className="th-buckets">
                <div className="th-content">
                  <span>Buckets</span>
                  <Filter size={12} className="th-filter-icon" />
                </div>
              </th>

              <th className="th-cases" onClick={() => handleSort('caseCounts')}>
                <div className="th-content th-align-right">
                  <span>Case counts</span>
                  <ArrowUpDown size={13} className="th-sort-icon" />
                </div>
              </th>

              <th className="th-dnd">
                <div className="th-content th-align-right">
                  <span>DND</span>
                </div>
              </th>

              <th className="th-outstanding">
                <div className="th-content">
                  <span>Sum of Outstanding</span>
                </div>
              </th>

              <th className="th-created" onClick={() => handleSort('createdOn')}>
                <div className="th-content">
                  <span>Created On</span>
                  <ArrowUpDown size={13} className="th-sort-icon" />
                </div>
              </th>

              <th className="th-status">
                <div className="th-content">
                  <span>Allocation Status</span>
                </div>
              </th>

              <th className="th-collection" onClick={() => handleSort('collectionPercent')}>
                <div className="th-content">
                  <span>Collection %</span>
                  <ArrowUpDown size={13} className="th-sort-icon" />
                </div>
              </th>

              <th className="th-payment-status">
                <div className="th-content">
                  <span>Payment file status</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <AllocationTableRow
                  key={item.id}
                  item={item}
                  onUploadFileClick={onUploadFileClick}
                />
              ))
            ) : (
              <tr>
                <td colSpan={10} className="alloc-empty-cell">
                  <div className="alloc-empty-state">
                    <p className="alloc-empty-title">No allocations found for this category</p>
                    <p className="alloc-empty-desc">Try switching tabs or upload a new allocation file</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllocationTable;
