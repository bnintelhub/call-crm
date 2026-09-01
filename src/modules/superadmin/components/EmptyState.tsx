import React from 'react';
import { SearchX, FolderOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: 'search' | 'folder' | 'alert';
}

export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon = 'folder',
}: EmptyStateProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'search':
        return <SearchX size={38} className="sa-empty-icon" />;
      case 'alert':
        return <AlertCircle size={38} className="sa-empty-icon" />;
      default:
        return <FolderOpen size={38} className="sa-empty-icon" />;
    }
  };

  return (
    <div className="sa-empty-state-card">
      <div className="sa-empty-icon-circle">{renderIcon()}</div>
      <h3 className="sa-empty-title">{title}</h3>
      <p className="sa-empty-desc">{description}</p>
      {actionText && onAction && (
        <button type="button" className="btn btn-secondary btn-sm sa-empty-btn" onClick={onAction}>
          <RefreshCw size={14} /> {actionText}
        </button>
      )}
    </div>
  );
}
