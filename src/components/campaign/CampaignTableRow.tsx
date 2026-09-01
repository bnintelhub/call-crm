import React from 'react';
import type { CampaignItem } from '../../data/campaignData';
import CampaignStatusBadge from './CampaignStatusBadge';
import CampaignActionMenu from './CampaignActionMenu';

interface CampaignTableRowProps {
  campaign: CampaignItem;
  onAction: (action: 'view' | 'edit' | 'delete', campaign: CampaignItem) => void;
}

export const CampaignTableRow: React.FC<CampaignTableRowProps> = ({
  campaign,
  onAction,
}) => {
  return (
    <tr className="campaign-table-row">
      {/* 1. Campaigns */}
      <td className="campaign-cell-name">
        <span className="campaign-name-text" title={campaign.name}>
          {campaign.name}
        </span>
      </td>

      {/* 2. Category */}
      <td className="campaign-cell-category">
        <span className="campaign-cat-tag">{campaign.category}</span>
      </td>

      {/* 3. Borrower Count */}
      <td className="campaign-cell-number">
        <span>{campaign.borrowerCount}</span>
      </td>

      {/* 4. Left Out Borrower */}
      <td className="campaign-cell-number">
        <span>{campaign.leftOutBorrower}</span>
      </td>

      {/* 5. Contactability */}
      <td className="campaign-cell-number">
        <span>{campaign.contactability}</span>
      </td>

      {/* 6. Agents Count */}
      <td className="campaign-cell-number">
        <span>{campaign.agentsCount}</span>
      </td>

      {/* 7. Completed Autoch */}
      <td className="campaign-cell-number">
        <span>{campaign.completedAutodial}</span>
      </td>

      {/* 8. Status */}
      <td className="campaign-cell-status">
        <CampaignStatusBadge status={campaign.status} />
      </td>

      {/* 9. Action */}
      <td className="campaign-cell-action">
        <CampaignActionMenu campaign={campaign} onAction={onAction} />
      </td>
    </tr>
  );
};

export default CampaignTableRow;
