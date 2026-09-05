import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { PRODUCT_OPTIONS, BUCKET_OPTIONS } from '../../data/allocationMockData';

interface SampleFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadSuccess?: (product: string, bucket: string) => void;
}

export const SampleFileModal: React.FC<SampleFileModalProps> = ({
  isOpen,
  onClose,
  onDownloadSuccess,
}) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const isFormValid = selectedProduct.trim() !== '' && selectedBucket.trim() !== '';

  const handleDownload = () => {
    if (!isFormValid) return;

    setDownloading(true);
    setTimeout(() => {
      // Create a dummy CSV template download
      const csvContent = "LoanNumber,BorrowerName,PhoneNumber,DPDDays,TotalDueAmount,Bucket,Product\nLN-1001,Rajesh Kumar,9876543210,45,25000," + selectedBucket + "," + selectedProduct + "\nLN-1002,Pooja Sharma,9876543211,15,12500," + selectedBucket + "," + selectedProduct + "\n";
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Sample_Allocation_${selectedProduct.replace(/\s+/g, '_')}_${selectedBucket.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading(false);
      setDownloaded(true);
      if (onDownloadSuccess) {
        onDownloadSuccess(selectedProduct, selectedBucket);
      }
      setTimeout(() => {
        setDownloaded(false);
        onClose();
      }, 1000);
    }, 600);
  };

  return (
    <div className="sample-modal-backdrop" onClick={onClose}>
      <div className="sample-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sample-modal-header">
          <div className="sample-modal-header-left">
            <FileSpreadsheet size={20} className="sample-modal-icon" />
            <h3 className="sample-modal-title">Sample Allocation File</h3>
          </div>
          <button type="button" className="sample-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="sample-modal-body">
          <p className="sample-modal-intro">
            Select the target product and delinquency bucket to generate a pre-configured template with proper headers and validation formats.
          </p>

          <div className="sample-modal-field">
            <label className="sample-field-label">
              Select Product <span className="req-star">*</span>
            </label>
            <select
              className="sample-field-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Product</option>
              {PRODUCT_OPTIONS.map((prod) => (
                <option key={prod.id} value={prod.label}>
                  {prod.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sample-modal-field">
            <label className="sample-field-label">
              Select Bucket <span className="req-star">*</span>
            </label>
            <select
              className="sample-field-select"
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
            >
              <option value="">Bucket</option>
              {BUCKET_OPTIONS.map((bkt) => (
                <option key={bkt.id} value={bkt.label}>
                  {bkt.label} ({bkt.dpdRange})
                </option>
              ))}
            </select>
          </div>

          {downloaded && (
            <div className="sample-success-alert">
              <CheckCircle2 size={16} />
              <span>Sample template downloaded successfully!</span>
            </div>
          )}
        </div>

        <div className="sample-modal-footer">
          <button type="button" className="sample-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="sample-btn-primary"
            disabled={!isFormValid || downloading}
            onClick={handleDownload}
          >
            <Download size={15} />
            <span>{downloading ? 'Generating...' : 'Download File'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SampleFileModal;
