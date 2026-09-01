import React from 'react';
import ProductSelect from './ProductSelect';
import BucketSelect from './BucketSelect';
import DateRangeField from './DateRangeField';
import { ArrowRight, FileSpreadsheet, Building2, Tag, Info } from 'lucide-react';
import { useOrgStore } from '../../store/orgStore';
import { generateAllocationName } from '../../store/allocationStore';

export interface AllocationFormData {
  product: string;
  bucket: string;
  outstanding: string;
  startDate: string;
  endDate: string;
}

export interface FormErrors {
  product?: string;
  bucket?: string;
  outstanding?: string;
  duration?: string;
  file?: string;
}

interface AllocationFormProps {
  formData: AllocationFormData;
  formErrors: FormErrors;
  onChange: (field: keyof AllocationFormData, value: string) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isFormValid: boolean;
  isSubmitting: boolean;
  selectedFileName?: string;
}

export const AllocationForm: React.FC<AllocationFormProps> = ({
  formData,
  formErrors,
  onChange,
  onCancel,
  onSubmit,
  isFormValid,
  isSubmitting,
  selectedFileName,
}) => {
  const { companyName } = useOrgStore();

  const previewDate = formData.startDate ? new Date(formData.startDate) : new Date();
  const validDate = isNaN(previewDate.getTime()) ? new Date() : previewDate;
  const year = validDate.getFullYear();
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const day = String(validDate.getDate()).padStart(2, '0');

  const baseFile = selectedFileName
    ? selectedFileName.replace(/\.[^/.]+$/, '').replace(/[\s-]+/g, '_')
    : `${companyName || 'Moneyview'}_${formData.product || 'Product'}_${formData.bucket || 'Bucket'}`.replace(/[\s-]+/g, '_');

  const liveAllocationName = generateAllocationName(baseFile, formData.startDate);

  return (
    <form onSubmit={onSubmit} className="allocation-config-form">
      <div className="form-rows-container">
        {/* 1. Product */}
        <div className="form-row-item">
          <label className="form-row-label">
            Product <span className="req-asterisk">*</span>
          </label>
          <div className="form-row-input-col">
            <ProductSelect
              value={formData.product}
              onChange={(val) => onChange('product', val)}
              error={formErrors.product}
            />
          </div>
        </div>

        {/* 2. Bucket */}
        <div className="form-row-item">
          <label className="form-row-label">
            Bucket <span className="req-asterisk">*</span>
          </label>
          <div className="form-row-input-col">
            <BucketSelect
              value={formData.bucket}
              onChange={(val) => onChange('bucket', val)}
              error={formErrors.bucket}
            />
          </div>
        </div>

        {/* 3. Outstanding */}
        <div className="form-row-item">
          <label className="form-row-label">
            Outstanding <span className="req-asterisk">*</span>
          </label>
          <div className="form-row-input-col">
            <input
              type="text"
              className={`form-standard-input ${formErrors.outstanding ? 'has-error' : ''}`}
              placeholder="e.g. ₹35.6 Lakh or 3560000"
              value={formData.outstanding}
              onChange={(e) => onChange('outstanding', e.target.value)}
            />
            {formErrors.outstanding && (
              <span className="field-error-message">{formErrors.outstanding}</span>
            )}
          </div>
        </div>

        {/* 4. Duration */}
        <div className="form-row-item">
          <label className="form-row-label">
            Duration <span className="req-asterisk">*</span>
          </label>
          <div className="form-row-input-col">
            <DateRangeField
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={(val) => onChange('startDate', val)}
              onEndDateChange={(val) => onChange('endDate', val)}
              error={formErrors.duration}
            />
          </div>
        </div>
      </div>

      {/* 5. Live Allocation Name Preview */}
      <div className="alloc-name-preview-card">
        <div className="alloc-preview-top">
          <div className="alloc-preview-title-wrap">
            <Tag size={15} className="alloc-preview-title-icon" />
            <span className="alloc-preview-heading">Allocation Name Preview</span>
          </div>
          <div className="alloc-preview-badge-group">
            <span className="alloc-preview-org-badge" title="Retrieved from Navbar">
              <Building2 size={12} />
              Navbar Org: <strong>{companyName}</strong>
            </span>
            <span className="alloc-preview-target-badge">
              Target: <strong>Unallocated Tab</strong>
            </span>
          </div>
        </div>

        <div className="alloc-preview-code-box">
          <FileSpreadsheet size={18} className="alloc-preview-file-icon" />
          <span className="alloc-preview-filename">{liveAllocationName}</span>
        </div>

        <div className="alloc-preview-breakdown">
          <div className="pattern-item">
            <span className="pattern-tag-label">File Name</span>
            <span className="pattern-pill company">{baseFile}</span>
          </div>
          <span className="pattern-sep">_</span>

          <div className="pattern-item">
            <span className="pattern-tag-label">Year</span>
            <span className="pattern-pill year">{year}</span>
          </div>
          <span className="pattern-sep">_</span>

          <div className="pattern-item">
            <span className="pattern-tag-label">Date</span>
            <span className="pattern-pill date">{month}-{day}</span>
          </div>
        </div>

        <div className="alloc-preview-note">
          <Info size={13} />
          <span>Naming pattern: <code>filename_year_date</code>. Reflects immediately in the <strong>Unallocated</strong> tab upon upload.</span>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="form-actions-footer">
        <button
          type="button"
          className="form-btn-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="form-btn-proceed"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? 'Uploading & Allocating...' : 'Proceed & Add to Unallocated'}</span>
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
      </div>
    </form>
  );
};

export default AllocationForm;
