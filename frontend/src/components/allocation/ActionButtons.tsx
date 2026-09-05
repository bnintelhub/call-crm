import React from 'react';
import { History, Upload } from 'lucide-react';

interface ActionButtonsProps {
  onUploadHistoryClick: () => void;
  onUploadNewFileClick: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onUploadHistoryClick,
  onUploadNewFileClick,
}) => {
  return (
    <div className="alloc-action-buttons">
      <button
        type="button"
        className="alloc-btn-outline"
        onClick={onUploadHistoryClick}
      >
        <History size={16} className="alloc-btn-icon" />
        <span>Upload History</span>
      </button>

      <button
        type="button"
        className="alloc-btn-solid"
        onClick={onUploadNewFileClick}
      >
        <Upload size={16} className="alloc-btn-icon" />
        <span>Upload New File</span>
      </button>
    </div>
  );
};

export default ActionButtons;
