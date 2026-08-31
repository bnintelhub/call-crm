import React from 'react';

interface CampaignStatusBadgeProps {
  status: 'Running' | 'Paused' | 'Completed' | string;
}

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({ status }) => {
  const isRunning = status.toLowerCase() === 'running';

  return (
    <span className={`campaign-status-pill ${isRunning ? 'status-running' : 'status-paused'}`}>
      <span className="status-dot" />
      <span className="status-text">{status}</span>
    </span>
  );
};

export default CampaignStatusBadge;
