import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';
import CampaignTableRow from './CampaignTableRow';

interface CampaignTableProps {
  campaigns: CampaignItem[];
  onAction: (action: 'view' | 'edit' | 'delete', campaign: CampaignItem) => void;
}

type SortField = 'name' | 'category' | 'agentsCount' | 'completedAutodial' | 'status';

export const CampaignTable: React.FC<CampaignTableProps> = ({
  campaigns,
  onAction,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (sortField === 'agentsCount' || sortField === 'completedAutodial') {
      return sortAsc ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
    }
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    const comp = valA.localeCompare(valB);
    return sortAsc ? comp : -comp;
  });

  return (
    <div className="campaign-table-card">
      <div className="campaign-table-scroll-wrap">
        <table className="campaign-data-table">
          <thead>
            <tr>
              {/* 1. Campaigns */}
              <th className="th-campaign-name" onClick={() => handleSort('name')}>
                <div className="th-inner-cell">
                  <span>Campaigns</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 2. Category */}
              <th className="th-campaign-cat" onClick={() => handleSort('category')}>
                <div className="th-inner-cell">
                  <span>Category</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 3. Borrower Count */}
              <th className="th-campaign-num">
                <div className="th-inner-cell center">
                  <span>Borrower Count</span>
                </div>
              </th>

              {/* 4. Left Out Borrower */}
              <th className="th-campaign-num">
                <div className="th-inner-cell center">
                  <span>Left Out Borrower</span>
                </div>
              </th>

              {/* 5. Contactability */}
              <th className="th-campaign-num">
                <div className="th-inner-cell center">
                  <span>Contactability</span>
                </div>
              </th>

              {/* 6. Agents Count */}
              <th className="th-campaign-num" onClick={() => handleSort('agentsCount')}>
                <div className="th-inner-cell center">
                  <span>Agents Count</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 7. Completed Autoch */}
              <th className="th-campaign-num" onClick={() => handleSort('completedAutodial')}>
                <div className="th-inner-cell center">
                  <span>Completed Autoch...</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 8. Status */}
              <th className="th-campaign-status" onClick={() => handleSort('status')}>
                <div className="th-inner-cell center">
                  <span>Status</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 9. Action */}
              <th className="th-campaign-action">
                <div className="th-inner-cell center">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedCampaigns.length > 0 ? (
              sortedCampaigns.map((camp) => (
                <CampaignTableRow
                  key={camp.id}
                  campaign={camp}
                  onAction={onAction}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9} className="campaign-empty-row">
                  <div className="campaign-empty-box">
                    <p className="campaign-empty-title">No campaigns match your search</p>
                    <p className="campaign-empty-subtitle">Try searching with a different campaign name</p>
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

export default CampaignTable;
