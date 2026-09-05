import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload, List, FileSpreadsheet,
  CheckCircle2, Sparkles, AlertCircle, RefreshCw, Download, FileX2
} from 'lucide-react';
import FileUploadZone from '../../components/allocation/FileUploadZone';
import SampleFileCard from '../../components/allocation/SampleFileCard';
import SampleFileModal from '../../components/allocation/SampleFileModal';
import AllocationForm, { type AllocationFormData, type FormErrors } from '../../components/allocation/AllocationForm';
import DataMappingUI from '../../components/allocation/DataMappingUI';
import { extractHeadersAndData, processMappedData, generateErrorReport, type ProcessResult } from '../../utils/processExcel';
import './UploadAllocationPage.css';

import { useOrgStore } from '../../store/orgStore';
import { useAllocationStore, generateAllocationName } from '../../store/allocationStore';
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

  // Steps
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
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
  
  // Mapping & Processing State
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [createdAllocName, setCreatedAllocName] = useState<string>('');
  
  // Generate an ID for IDB
  const [tempAllocId] = useState(`alloc-${Date.now()}`);

  const handleFieldChange = (field: keyof AllocationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!selectedFile) errors.file = 'Please upload or select an allocation file (.xls, .xlsx, .xlsb, .csv)';
    if (!formData.product.trim()) errors.product = 'Please select a product';
    if (!formData.bucket.trim()) errors.bucket = 'Please select a delinquency bucket';
    if (!formData.outstanding.trim()) errors.outstanding = 'Please enter outstanding value';
    if (!formData.startDate) errors.duration = 'Start date is required';
    else if (!formData.endDate) errors.duration = 'End date is required';
    else if (new Date(formData.endDate) < new Date(formData.startDate)) errors.duration = 'End date cannot be earlier than start date';

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

  const handleProceedToMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedFile) return;

    setIsSubmitting(true);
    try {
      const { headers, rawData } = await extractHeadersAndData(selectedFile);
      if (headers.length === 0) {
        setFormErrors({ file: 'The uploaded file appears to be empty.' });
        setIsSubmitting(false);
        return;
      }
      setFileHeaders(headers);
      setRawData(rawData);
      setStep(2); // Go to mapping
    } catch (err) {
      setFormErrors({ file: 'Failed to read the file. Please ensure it is a valid Excel/CSV file.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmMapping = async (mapping: Record<string, string>) => {
    setIsSubmitting(true);
    setProcessError(null);
    setProgress(0);
    setStep(3); // Go to processing UI
    try {
      const allocationId = tempAllocId;
      const result = await processMappedData(rawData, mapping, allocationId, (p) => setProgress(p));
      setProcessResult(result);
    } catch (err: any) {
      console.error(err);
      setProcessError(err.message || "An unknown error occurred during processing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = () => {
    if (!processResult) return;
    
    // Create the persistent metadata
    const finalName = generateAllocationName(
      companyName,
      formData.product,
      formData.bucket,
      formData.startDate
    );

    addAllocation(
      {
        id: tempAllocId,
        companyName,
        product: formData.product,
        bucket: formData.bucket,
        outstanding: formData.outstanding,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allocationName: finalName,
        caseCounts: processResult.successCount // Update with actual valid row count
      },
      selectedFile,
      user?.name || 'Zeeshan Anwar'
    );

    setCreatedAllocName(finalName);

    setTimeout(() => {
      navigate('/ivr/allocation-list?tab=Unallocated', {
        state: {
          tab: 'Unallocated',
          newAllocId: tempAllocId,
          allocationName: finalName,
        },
      });
    }, 1200);
  };

  const handleCancel = () => {
    navigate('/ivr/allocation-list');
  };

  return (
    <div className="upload-allocation-page">
      <div className="upload-page-header">
        <div className="upload-title-group">
          <h1 className="upload-page-title">
            <Upload size={24} className="upload-title-icon" />
            Upload New File {step > 1 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem', fontSize: '1.25rem' }}> - Step {step} of 3</span>}
          </h1>
          <p className="upload-page-subtitle">
            {step === 1 && "Upload a new allocation file here to begin planning and assignment."}
            {step === 2 && "Map your excel columns to the system correctly."}
            {step === 3 && "Review the processing summary before finalizing."}
          </p>
        </div>

        <Link to="/ivr/allocation-list" className="upload-view-list-btn">
          <List size={16} />
          <span>View Allocation List</span>
        </Link>
      </div>

      <div className="upload-header-divider" />

      {/* Step 1: Upload & Form */}
      {step === 1 && (
        <>
          <div className="upload-top-grid">
            <FileUploadZone
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              error={formErrors.file}
            />
            <SampleFileCard onOpenModal={() => setIsSampleModalOpen(true)} />
          </div>

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
              onSubmit={handleProceedToMapping}
              isFormValid={isFormValid}
              isSubmitting={isSubmitting}
            />
          </div>
        </>
      )}

      {/* Step 2: Mapping UI */}
      {step === 2 && (
        <DataMappingUI 
          fileHeaders={fileHeaders} 
          onConfirm={handleConfirmMapping} 
          onCancel={() => setStep(1)} 
        />
      )}

      {/* Step 3: Processing & Summary */}
      {step === 3 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', padding: '2rem' }}>
          {processError ? (
            <div style={{ textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Processing Failed</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{processError}</p>
              <button onClick={() => setStep(1)} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.375rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>Start Over</button>
            </div>
          ) : isSubmitting || !processResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <RefreshCw size={40} className="spinner" style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', animation: 'spin 1s linear infinite' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>Processing Data... {progress}%</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Validating rows against system rules. This may take a moment.</p>
              <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '1.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {processResult.failedCount === 0 ? (
                  <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                ) : (
                  <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                )}
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>Processing Complete</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Successfully validated {processResult.successCount} rows.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem', width: '200px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{processResult.total}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Rows</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '0.5rem', padding: '1.5rem', width: '200px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>{processResult.successCount}</div>
                  <div style={{ fontSize: '0.875rem', color: '#10b981' }}>Successful</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', padding: '1.5rem', width: '200px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>{processResult.failedCount}</div>
                  <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>Failed</div>
                </div>
              </div>

              {processResult.failedCount > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileX2 size={18} /> Some rows failed validation
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.25rem' }}>
                      Download the error report to see exactly why these rows failed. You can fix them and upload them later.
                    </p>
                  </div>
                  <button 
                    onClick={() => generateErrorReport(processResult.errors, selectedFile?.name || 'allocation')}
                    style={{ background: 'white', border: '1px solid #d97706', color: '#b45309', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    <Download size={16} /> Error Report
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <button 
                  onClick={() => setStep(1)} 
                  style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.375rem', color: 'var(--text-primary)', fontWeight: '500', cursor: 'pointer' }}
                >
                  Start Over
                </button>
                <button 
                  onClick={handleFinalize} 
                  disabled={processResult.successCount === 0}
                  style={{ padding: '0.625rem 1.25rem', background: 'var(--accent-primary)', border: 'none', borderRadius: '0.375rem', color: 'white', fontWeight: '600', cursor: processResult.successCount === 0 ? 'not-allowed' : 'pointer', opacity: processResult.successCount === 0 ? 0.5 : 1 }}
                >
                  Finalize & Add to Unallocated
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <SampleFileModal isOpen={isSampleModalOpen} onClose={() => setIsSampleModalOpen(false)} />
    </div>
  );
};

export default UploadAllocationPage;
