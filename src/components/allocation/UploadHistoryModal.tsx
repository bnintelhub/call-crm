import React from 'react';
import { X, CheckCircle2, FileSpreadsheet, Download } from 'lucide-react';
import { mockUploadHistory } from '../../data/allocationData';

interface UploadHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadHistoryModal: React.FC<UploadHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="alloc-modal-backdrop" onClick={onClose}>
      <div className="alloc-modal-content alloc-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="alloc-modal-header">
          <div>
            <h3 className="alloc-modal-title">Upload History</h3>
            <p className="alloc-modal-subtitle">
              Audit logs of all batch allocation files uploaded to Moneyview system
            </p>
          </div>
          <button type="button" className="alloc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="alloc-modal-body" style={{ padding: '0' }}>
          <div className="alloc-table-scroll-wrapper" style={{ maxHeight: '420px' }}>
            <table className="alloc-data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>File Name</th>
                  <th>Uploaded By</th>
                  <th>Upload Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Total Cases</th>
                  <th style={{ textAlign: 'right' }}>Success</th>
                  <th style={{ textAlign: 'right' }}>Failed</th>
                  <th>Status</th>
                  <th>Log</th>
                </tr>
              </thead>
              <tbody>
                {mockUploadHistory.map((item) => (
                  <tr key={item.id} className="alloc-table-row">
                    <td style={{ fontWeight: 600, color: 'var(--alloc-primary)' }}>{item.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileSpreadsheet size={16} style={{ color: '#10B981' }} />
                        <span style={{ fontWeight: 500 }}>{item.fileName}</span>
                      </div>
                    </td>
                    <td>{item.uploadedBy}</td>
                    <td style={{ color: '#6B7280' }}>{item.uploadDate}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.totalRecords}</td>
                    <td style={{ textAlign: 'right', color: '#10B981', fontWeight: 600 }}>{item.successfulRecords}</td>
                    <td style={{ textAlign: 'right', color: item.failedRecords > 0 ? '#EF4444' : '#6B7280' }}>{item.failedRecords}</td>
                    <td>
                      <span className="alloc-status-badge alloc-badge-fully">
                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="alloc-upload-action-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={13} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="alloc-modal-footer">
          <button type="button" className="alloc-btn-cancel" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadHistoryModal;
