import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload, List, FileSpreadsheet,
  CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';
import FileUploadZone from '../../components/allocation/FileUploadZone';
import SampleFileCard from '../../components/allocation/SampleFileCard';
import SampleFileModal from '../../components/allocation/SampleFileModal';
import AllocationForm, { type AllocationFormData, type FormErrors } from '../../components/allocation/AllocationForm';
import './UploadAllocationPage.css';

import { useOrgStore } from '../../store/orgStore';
import { useAllocationStore } from '../../store/allocationStore';
import { useAuthStore } from '../../store/authStore';

export const UploadAllocationPage: React.FC = () => {
  const navigate = useNavigate();
  const { companyName } = useOrgStore();
  const { addAllocation } = useAllocationStore();
  const { user } = useAuthStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonthDate = new Date();
  nextMonthDate.setDate(nextMonthDate.getDate() + 30);
  const nextMonthStr = nextMonthDate.toISOString().split('T')[0];

  // State management as specified
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<AllocationFormData>({
    product: '',
    bucket: '',
    outstanding: '',
    startDate: todayStr,
    endDate: nextMonthStr,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAllocName, setCreatedAllocName] = useState<string>('');

  const handleFieldChange = (field: keyof AllocationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === 'startDate' || field === 'endDate') {
      if (formErrors.duration) {
        setFormErrors((prev) => ({ ...prev, duration: undefined }));
      }
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file && formErrors.file) {
      setFormErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  // Comprehensive Frontend Validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!selectedFile) {
      errors.file = 'Please upload or select an allocation file (.xls, .xlsx, .xlsb, .csv)';
    }

    if (!formData.product.trim()) {
      errors.product = 'Please select a product';
    }

    if (!formData.bucket.trim()) {
      errors.bucket = 'Please select a delinquency bucket';
    }

    if (!formData.outstanding.trim()) {
      errors.outstanding = 'Please enter outstanding value';
    }

    if (!formData.startDate) {
      errors.duration = 'Start date is required';
    } else if (!formData.endDate) {
      errors.duration = 'End date is required';
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.duration = 'End date cannot be earlier than start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      selectedFile !== null &&
      formData.product.trim() !== '' &&
      formData.bucket.trim() !== '' &&
      formData.outstanding.trim() !== '' &&
      formData.startDate !== '' &&
      formData.endDate !== '' &&
      new Date(formData.endDate) >= new Date(formData.startDate)
    );
  }, [selectedFile, formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Add to persistent allocation store
    const newAllocation = addAllocation(
      {
        companyName,
        product: formData.product,
        bucket: formData.bucket,
        outstanding: formData.outstanding,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      selectedFile,
      user?.name || 'Zeeshan Anwar'
    );

    setCreatedAllocName(newAllocation.allocationName);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/allocation?tab=Unallocated', {
          state: {
            tab: 'Unallocated',
            newAllocId: newAllocation.id,
            allocationName: newAllocation.allocationName,
          },
        });
      }, 1200);
    }, 800);
  };

  const handleCancel = () => {
    navigate('/allocation');
  };

  return (
    <div className="upload-allocation-page">
      {/* 1. Page Header */}
      <div className="upload-page-header">
        <div className="upload-title-group">
          <h1 className="upload-page-title">
            <Upload size={24} className="upload-title-icon" />
            Upload New File
          </h1>
          <p className="upload-page-subtitle">
            Upload a new allocation file here to begin planning and assignment to channels.
          </p>
        </div>

        {/* View Allocation List Action */}
        <Link to="/allocation" className="upload-view-list-btn">
          <List size={16} />
          <span>View Allocation List</span>
        </Link>
      </div>

      <div className="upload-header-divider" />

      {/* Success Banner */}
      {isSuccess && (
        <div className="alloc-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={20} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.875rem' }}>Allocation File Processed Successfully!</strong>
            <span style={{ fontSize: '0.8125rem' }}>
              Created <strong>{createdAllocName}</strong> &bull; Added to <strong>Unallocated</strong> tab. Redirecting...
            </span>
          </div>
        </div>
      )}

      {/* 2. Main Layout (Top Grid: Upload Zone 2fr + Sample Card 1fr) */}
      <div className="upload-top-grid">
        <FileUploadZone
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          error={formErrors.file}
        />

        <SampleFileCard
          onOpenModal={() => setIsSampleModalOpen(true)}
        />
      </div>

      {/* 3. Allocation Configuration Form Card */}
      <div className="allocation-form-card">
        <div className="allocation-form-header">
          <Sparkles size={18} style={{ color: 'var(--accent-primary-light)' }} />
          <h2 className="allocation-form-title">Allocation Configuration</h2>
        </div>

        <AllocationForm
          formData={formData}
          formErrors={formErrors}
          onChange={handleFieldChange}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          isFormValid={isFormValid}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* 4. Sample Allocation File Modal */}
      <SampleFileModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />
    </div>
  );
};

export default UploadAllocationPage;
