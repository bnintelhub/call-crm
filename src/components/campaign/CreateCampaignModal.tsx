import React, { useState, useEffect } from 'react';
import { X, Megaphone, CheckCircle2, Zap, PlayCircle, Sliders, Eye, FileSpreadsheet, Layers, Users, IndianRupee } from 'lucide-react';
import type { CampaignItem } from '../../data/campaignData';
import { useAllocationStore } from '../../store/allocationStore';
import { useOrgStore } from '../../store/orgStore';
import { generateCampaignName } from '../../store/campaignStore';
import type { AllocationItem } from '../../data/allocationData';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (newCamp: CampaignItem) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCampaignCreated,
}) => {
  const { allocationsList, updateAllocation } = useAllocationStore();
  const { companyName } = useOrgStore();

  // Filter unallocated allocations from the allocation list page
  const unallocatedList = allocationsList.filter(
    (a) => a.tabCategory === 'Unallocated' || a.allocationStatus === 'Unallocated'
  );

  const [selectedAllocId, setSelectedAllocId] = useState<string>('');
  const [selectedAlloc, setSelectedAlloc] = useState<AllocationItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'PREDICTIVE' as 'PREDICTIVE' | 'MANUAL' | 'PROGRESSIVE' | 'PREVIEW',
    targetQueue: 'Tier-1 Overdue',
    strategy: 'High Velocity Ratio 3:1',
    agentsCount: 4,
    status: 'Running' as 'Running' | 'Paused',
    borrowerCount: 0,
  });

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-select first unallocated batch when modal opens
  useEffect(() => {
    if (isOpen && unallocatedList.length > 0 && !selectedAllocId) {
      const firstAlloc = unallocatedList[0];
      setSelectedAllocId(firstAlloc.id);
      setSelectedAlloc(firstAlloc);
      const generatedName = generateCampaignName(
        companyName,
        firstAlloc.product,
        firstAlloc.buckets,
        new Date()
      );
      setFormData((prev) => ({
        ...prev,
        name: generatedName,
        targetQueue: `${firstAlloc.product} - ${firstAlloc.buckets}`,
        borrowerCount: firstAlloc.caseCounts,
      }));
    }
  }, [isOpen, unallocatedList, companyName]);

  if (!isOpen) return null;

  const categories = [
    { id: 'PREDICTIVE', label: 'Predictive', desc: 'Auto-dial with predictive pace', icon: Zap },
    { id: 'PROGRESSIVE', label: 'Progressive', desc: '1:1 dial upon agent availability', icon: PlayCircle },
    { id: 'MANUAL', label: 'Manual', desc: 'Agent manually clicks to dial', icon: Sliders },
    { id: 'PREVIEW', label: 'Preview', desc: 'Agent reviews borrower data first', icon: Eye },
  ];

  // Handle choosing an unallocated batch from allocation list
  const handleAllocationChange = (allocId: string) => {
    setSelectedAllocId(allocId);
    setError('');

    if (!allocId || allocId === 'custom') {
      setSelectedAlloc(null);
      setFormData((prev) => ({
        ...prev,
        name: generateCampaignName(companyName, 'Personal Loan', 'Fresh', new Date()),
        borrowerCount: 0,
      }));
      return;
    }

    const found = unallocatedList.find((a) => a.id === allocId);
    if (found) {
      setSelectedAlloc(found);
      const generatedName = generateCampaignName(
        companyName,
        found.product,
        found.buckets,
        new Date()
      );
      setFormData((prev) => ({
        ...prev,
        name: generatedName, // company name_product_bucket_year_date
        targetQueue: `${found.product} - ${found.buckets}`,
        borrowerCount: found.caseCounts,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    const totalBorrowers = selectedAlloc ? selectedAlloc.caseCounts : (Number(formData.borrowerCount) || 0);

    const newCamp: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      borrowerCount: totalBorrowers,
      leftOutBorrower: totalBorrowers,
      contactability: 0,
      agentsCount: Number(formData.agentsCount) || 1,
      completedAutodial: 0,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      strategy: formData.strategy,
      targetQueue: formData.targetQueue,
      allocationId: selectedAlloc?.id,
    };

    // When assigned to campaign, move unallocated data to allocated list (100% Allocated)
    if (selectedAlloc) {
      updateAllocation(selectedAlloc.id, {
        allocationStatus: 'Fully allocated',
        tabCategory: '100% Allocated',
      });
    }

    setIsSuccess(true);
    setTimeout(() => {
      onCampaignCreated(newCamp);
      setIsSuccess(false);
      onClose();
      // Reset form
      setSelectedAllocId('');
      setSelectedAlloc(null);
      setFormData({
        name: '',
        category: 'PREDICTIVE',
        targetQueue: 'Tier-1 Overdue',
        strategy: 'High Velocity Ratio 3:1',
        agentsCount: 4,
        status: 'Running',
        borrowerCount: 0,
      });
    }, 700);
  };

  return (
    <div className="campaign-modal-backdrop" onClick={onClose}>
      <div className="campaign-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="campaign-modal-header">
          <div className="campaign-modal-title-wrap">
            <div className="campaign-modal-icon-box">
              <Megaphone size={18} className="campaign-modal-icon" />
            </div>
            <div>
              <h3 className="campaign-modal-title">Create New Campaign</h3>
              <p className="campaign-modal-sub">Link unallocated file and configure dialer parameters</p>
            </div>
          </div>
          <button type="button" className="campaign-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="campaign-modal-success-state">
            <div className="campaign-success-icon-box">
              <CheckCircle2 size={36} className="success-icon" />
            </div>
            <h4>Campaign Created Successfully!</h4>
            <p>"{formData.name}" initialized from unallocated list and set to {formData.status}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="campaign-modal-form">
            {error && <div className="campaign-modal-error">{error}</div>}

            {/* 1. Unallocated Allocation Selection Dropdown */}
            <div className="campaign-form-group">
              <label>
                Source Allocation (Unallocated Batches) <span className="req-star">*</span>
              </label>
              <select
                className="campaign-form-input"
                value={selectedAllocId}
                onChange={(e) => handleAllocationChange(e.target.value)}
                autoFocus
              >
                {unallocatedList.length === 0 ? (
                  <option value="">No unallocated files available in Allocation List</option>
                ) : (
                  unallocatedList.map((alloc) => (
                    <option key={alloc.id} value={alloc.id}>
                      {alloc.allocationName} &bull; {alloc.product} ({alloc.buckets}) &bull; {alloc.caseCounts} cases &bull; {alloc.sumOfOutstanding}
                    </option>
                  ))
                )}
                <option value="custom">-- Custom / Standalone Campaign (No File Linked) --</option>
              </select>
            </div>

            {/* 2. Unallocated Data Summary Card */}
            {selectedAlloc && (
              <div className="campaign-alloc-preview-card">
                <div className="alloc-preview-top-row">
                  <div className="alloc-preview-file-title">
                    <FileSpreadsheet size={16} className="alloc-preview-icon" />
                    <strong>{selectedAlloc.allocationName}</strong>
                  </div>
                  <span className="alloc-badge-unallocated">
                    {selectedAlloc.caseCounts} accounts
                  </span>
                </div>

                <div className="alloc-preview-meta-grid">
                  <div className="alloc-meta-cell">
                    <span className="alloc-meta-label">Product</span>
                    <span className="alloc-meta-val">{selectedAlloc.product}</span>
                  </div>
                  <div className="alloc-meta-cell">
                    <span className="alloc-meta-label">Bucket</span>
                    <span className="alloc-meta-val">{selectedAlloc.buckets}</span>
                  </div>
                  <div className="alloc-meta-cell">
                    <span className="alloc-meta-label">Outstanding</span>
                    <span className="alloc-meta-val">{selectedAlloc.sumOfOutstanding}</span>
                  </div>
                  <div className="alloc-meta-cell">
                    <span className="alloc-meta-label">Uploaded On</span>
                    <span className="alloc-meta-val">{selectedAlloc.createdOn}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Campaign Name */}
            <div className="campaign-form-group">
              <label>Campaign Name <span className="req-star">*</span></label>
              <input
                type="text"
                placeholder="e.g. Moneyview_Personal Loan_Fresh_2026_09-01"
                value={formData.name}
                onChange={(e) => {
                  setError('');
                  setFormData({ ...formData, name: e.target.value });
                }}
                className="campaign-form-input"
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem', display: 'block' }}>
                Format: <code>company name_product_bucket_year_date</code>
              </span>
            </div>

            {/* 4. Dialing Mode Cards */}
            <div className="campaign-form-group">
              <label>Dialing Mode</label>
              <div className="campaign-mode-grid">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`campaign-mode-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat.id as any })}
                    >
                      <div className="mode-card-header">
                        <Icon size={15} className="mode-icon" />
                        <span className="mode-card-title">{cat.label}</span>
                      </div>
                      <span className="mode-card-desc">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Grid for Queue & Strategy */}
            <div className="campaign-form-grid">
              <div className="campaign-form-group">
                <label>Target Queue</label>
                <input
                  type="text"
                  value={formData.targetQueue}
                  onChange={(e) => setFormData({ ...formData, targetQueue: e.target.value })}
                  className="campaign-form-input"
                  placeholder="e.g. Personal Loan - Fresh"
                />
              </div>

              <div className="campaign-form-group">
                <label>Dialing Strategy</label>
                <select
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="campaign-form-input"
                >
                  <option value="High Velocity Ratio 3:1">High Velocity Ratio 3:1</option>
                  <option value="Standard Ratio 2:1">Standard Ratio 2:1</option>
                  <option value="Sequential Ratio 1:1">Sequential Ratio 1:1</option>
                  <option value="Adaptive Dialing">Adaptive Dialing</option>
                  <option value="Pre-call Intel & Preview">Pre-call Intel & Preview</option>
                  <option value="Direct Click-to-Call">Direct Click-to-Call</option>
                </select>
              </div>
            </div>

            {/* 6. Grid for Agents & Initial Status */}
            <div className="campaign-form-grid">
              <div className="campaign-form-group">
                <label>Assigned Agents</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.agentsCount}
                  onChange={(e) => setFormData({ ...formData, agentsCount: Number(e.target.value) })}
                  className="campaign-form-input"
                />
              </div>

              <div className="campaign-form-group">
                <label>Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="campaign-form-input"
                >
                  <option value="Running">Running (Active)</option>
                  <option value="Paused">Paused (Standby)</option>
                </select>
              </div>
            </div>

            <div className="campaign-modal-footer">
              <button type="button" className="btn-camp-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-camp-submit-primary">
                Create Campaign
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateCampaignModal;
