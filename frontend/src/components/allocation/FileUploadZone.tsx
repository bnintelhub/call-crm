import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
}

const ACCEPTED_EXTENSIONS = ['.xls', '.xlsx', '.xlsb', '.csv'];
const ACCEPTED_MIME_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  'text/csv',
];

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  selectedFile,
  onFileSelect,
  error: externalError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isExtensionValid = ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

    if (!isExtensionValid) {
      setInternalError('Invalid file format. Please upload .xls, .xlsx, .xlsb, or .csv');
      onFileSelect(null);
      return;
    }

    setInternalError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const errorMessage = externalError || internalError;

  return (
    <div className="upload-zone-wrapper">
      <div
        className={`upload-dropzone-box ${isDragging ? 'is-dragging' : ''} ${selectedFile ? 'has-file' : ''} ${errorMessage ? 'has-error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="upload-file-input-hidden"
          accept=".xls,.xlsx,.xlsb,.csv"
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <div className="upload-selected-card">
            <div className="upload-file-icon-box">
              <FileSpreadsheet size={28} className="upload-excel-icon" />
            </div>
            <div className="upload-file-details">
              <span className="upload-file-name" title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className="upload-file-size">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to allocate
              </span>
            </div>
            <button
              type="button"
              className="upload-file-remove-btn"
              onClick={handleRemoveFile}
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-cloud-icon-box">
              <UploadCloud size={36} />
            </div>
            <p className="upload-main-text">
              Drag &amp; drop files or <span className="upload-browse-highlight">Browse</span>
            </p>
            <p className="upload-formats-text">
              Supported formats: .xls, .xlsx, .xlsb, .csv
            </p>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="upload-error-banner">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
