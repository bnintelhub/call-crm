import React from 'react';
import { Inbox } from 'lucide-react';

interface ReportTableEmptyStateProps {
  message?: string;
  colSpan?: number;
}

export const ReportTableEmptyState: React.FC<ReportTableEmptyStateProps> = ({
  message = 'No data',
  colSpan = 6,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="report-empty-cell">
        <div className="report-empty-state-wrap">
          <Inbox size={32} strokeWidth={1.5} className="report-empty-icon" />
          <span className="report-empty-text">{message}</span>
        </div>
      </td>
    </tr>
  );
};

export default ReportTableEmptyState;
