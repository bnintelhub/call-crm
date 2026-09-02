import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Building2, Tag } from 'lucide-react';
import type { AllocationItem } from '../../data/allocationData';
import { useOrgStore } from '../../store/orgStore';
import { useAllocationStore, generateAllocationName } from '../../store/allocationStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem?: AllocationItem | null;
  onSuccess?: (fileName: string, createdItem?: AllocationItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onSuccess,
}) => {
  const { companyName } = useOrgStore();
  const { addAllocation } = useAllocationStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productType, setProductType] = useState('Personal Loan');
  const [bucketType, setBucketType] = useState('Fresh');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const isPaymentUpload = !!targetItem;

  const previewName = generateAllocationName(
    selectedFile?.name || `${companyName}_${productType}_${bucketType}`,
    new Date()
  );

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setTimeout(() => {
      let created: AllocationItem | undefined;
      if (!isPaymentUpload) {
        created = addAllocation(
          {
            companyName,
            product: productType,
            bucket: bucketType,
            outstanding: '₹25.0 Lakh',
          },
          selectedFile
        );
      }

      setIsUploading(false);
      setUploadSuccess(true);
      if (onSuccess) onSuccess(selectedFile.name, created);
      setTimeout(() => {
        setUploadSuccess(false);
        setSelectedFile(null);
        onClose();
      }, 1200);
    }, 900);
  };

  return (
    <div className="alloc-modal-backdrop" onClick={onClose}>
      <div className="alloc-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alloc-modal-header">
          <div>
            <h3 className="alloc-modal-title">
              {isPaymentUpload ? 'Upload Payment File' : 'Upload New Allocation File'}
            </h3>
            <p className="alloc-modal-subtitle">
              {isPaymentUpload
                ? `Update payment reconciliation for: ${targetItem.allocationName}`
                : 'Upload Excel/CSV lead file for automated bucket allocation'}
            </p>
          </div>
          <button type="button" className="alloc-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="alloc-modal-body">
          {!isPaymentUpload && (
            <>
              <div className="alloc-form-row">
                <div className="alloc-form-group">
                  <label className="alloc-form-label">Product Type</label>
                  <select
                    className="alloc-form-select"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Credit Line">Credit Line</option>
                    <option value="Vehicle Loan">Vehicle Loan</option>
                    <option value="Home Improvement">Home Improvement</option>
                  </select>
                </div>

                <div className="alloc-form-group">
                  <label className="alloc-form-label">Delinquency Bucket</label>
                  <select
                    className="alloc-form-select"
                    value={bucketType}
                    onChange={(e) => setBucketType(e.target.value)}
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Pre Due">Pre Due</option>
                    <option value="DPD 1-30">DPD 1-30</option>
                    <option value="DPD 31-60">DPD 31-60</option>
                    <option value="DPD 61-90">DPD 61-90</option>
                    <option value="NPA">NPA</option>
                  </select>
                </div>
              </div>

              {/* Allocation Name Preview in Modal */}
              <div style={{
                padding: '0.625rem 0.875rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Auto Naming (<code>filename_year_date</code>):
                </span>
                <span style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: 'var(--accent-primary-light)',
                  wordBreak: 'break-all',
                }}>
                  {previewName}
                </span>
              </div>
            </>
          )}

          {/* Drag & Drop Zone */}
          <div
            className={`alloc-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            <input
              type="file"
              id="alloc-file-input"
              className="alloc-file-input-hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <label htmlFor="alloc-file-input" className="alloc-dropzone-label">
              <div className="alloc-dropzone-icon">
                <UploadCloud size={32} />
              </div>
              {selectedFile ? (
                <div className="alloc-selected-file">
                  <FileText size={20} className="alloc-file-icon" />
                  <span className="alloc-file-name">{selectedFile.name}</span>
                  <span className="alloc-file-size">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <>
                  <p className="alloc-dropzone-text">
                    <strong>Click to browse</strong> or drag & drop file here
                  </p>
                  <span className="alloc-dropzone-hint">
                    Supports .xlsx, .xls, .csv (Max file size: 25MB)
                  </span>
                </>
              )}
            </label>
          </div>

          {uploadSuccess && (
            <div className="alloc-alert-success">
              <CheckCircle2 size={16} />
              <span>File uploaded and queued for processing successfully!</span>
            </div>
          )}

          <div className="alloc-modal-footer">
            <button
              type="button"
              className="alloc-btn-cancel"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="alloc-btn-submit"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Process & Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
