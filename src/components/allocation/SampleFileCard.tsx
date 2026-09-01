import React from 'react';
import { FileDown, FileText, Download } from 'lucide-react';

interface SampleFileCardProps {
  onOpenModal: () => void;
}

export const SampleFileCard: React.FC<SampleFileCardProps> = ({ onOpenModal }) => {
  return (
    <div className="sample-file-card">
      <div className="sample-card-header">
        <div className="sample-icon-badge">
          <FileDown size={20} />
        </div>
        <h3 className="sample-card-title">Download Sample Allocation File</h3>
      </div>

      <p className="sample-card-desc">
        Use this template for correctly formatted, smooth processing.
      </p>

      <div className="sample-card-action">
        <button
          type="button"
          className="sample-download-btn"
          onClick={onOpenModal}
        >
          <Download size={15} />
          <span>Download File</span>
        </button>
      </div>
    </div>
  );
};

export default SampleFileCard;
