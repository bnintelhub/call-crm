import React from 'react';
import ProductSelect from './ProductSelect';
import BucketSelect from './BucketSelect';
import DateRangeField from './DateRangeField';
import { ArrowRight, RotateCcw } from 'lucide-react';

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
}

export const AllocationForm: React.FC<AllocationFormProps> = ({
  formData,
  formErrors,
  onChange,
  onCancel,
  onSubmit,
  isFormValid,
  isSubmitting,
}) => {
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
              placeholder="Enter outstanding value"
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
          <span>{isSubmitting ? 'Validating & Uploading...' : 'Proceed'}</span>
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
      </div>
    </form>
  );
};

export default AllocationForm;
