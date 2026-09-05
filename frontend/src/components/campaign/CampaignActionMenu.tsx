import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit3, Trash2 } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';

interface CampaignActionMenuProps {
  campaign: CampaignItem;
  onAction: (action: 'view' | 'edit' | 'delete', campaign: CampaignItem) => void;
}

export const CampaignActionMenu: React.FC<CampaignActionMenuProps> = ({
  campaign,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (action: 'view' | 'edit' | 'delete') => {
    setIsOpen(false);
    onAction(action, campaign);
  };

  return (
    <div className="campaign-action-wrap" ref={menuRef}>
      <button
        type="button"
        className={`campaign-action-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Campaign Actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="campaign-action-dropdown">
          <button
            type="button"
            className="campaign-menu-item"
            onClick={() => handleSelect('view')}
          >
            <Eye size={14} />
            <span>View</span>
          </button>
          <button
            type="button"
            className="campaign-menu-item"
            onClick={() => handleSelect('edit')}
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
          <div className="campaign-menu-divider" />
          <button
            type="button"
            className="campaign-menu-item item-danger"
            onClick={() => handleSelect('delete')}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignActionMenu;
