import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import type { AgentItem } from '../../data/agentMockData';
import { useAgentStore } from '../../store/agentStore';

interface OnboardAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentAdded?: (newAgent: AgentItem) => void;
}

export const OnboardAgentModal: React.FC<OnboardAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentAdded,
}) => {
  const { addAgent } = useAgentStore();

  const [formData, setFormData] = useState({
    agentName: '',
    supervisor: 'Priyam Kumar Singh',
    bnId: `BN${Math.floor(5260 + Math.random() * 50)}`,
    type: 'CALL' as 'CALL' | 'FIELD',
    dra: 'No' as 'Yes' | 'No',
    area: 'Ranchi',
    basePincode: '834010',
    residencePincode: '834010',
    currentAddress: '',
    permanentAddress: '',
    experience: '2 Years',
    campaign: '-',
    acr: '800 - 1000',
  });

  const [sameAddress, setSameAddress] = useState(true);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<AgentItem | null>(null);

  if (!isOpen) return null;

  const handleCurrentAddressChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      currentAddress: val,
      permanentAddress: sameAddress ? val : prev.permanentAddress,
    }));
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.currentAddress,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agentName.trim()) {
      setError('Agent Name is required');
      return;
    }

    const newAgent = addAgent({
      agentName: formData.agentName.trim(),
      supervisor: formData.supervisor.trim() || 'Priyam Kumar Singh',
      bnId: formData.bnId.trim(),
      type: 'CALL',
      dra: formData.dra,
      area: formData.area.trim() || 'Ranchi',
      basePincode: formData.basePincode.trim() || '834010',
      residencePincode: formData.residencePincode.trim() || '834010',
      currentAddress: formData.currentAddress.trim() || 'Ranchi',
      permanentAddress: (sameAddress ? formData.currentAddress : formData.permanentAddress).trim() || 'Ranchi',
      experience: formData.experience.trim() || '2 Years',
      campaign: formData.campaign.trim() || '-',
      acr: formData.acr.trim() || '800 - 1000',
    });

    setCreatedAgent(newAgent);
    setIsSuccess(true);

    if (onAgentAdded) {
      onAgentAdded(newAgent);
    }

    setTimeout(() => {
      setIsSuccess(false);
      setCreatedAgent(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div
        className="agent-modal-dialog"
        style={{ maxWidth: '680px', width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="agent-modal-header">
          <div className="agent-modal-title-wrap">
            <UserPlus size={20} className="agent-modal-icon" />
            <h3 className="agent-modal-title">Onboard New Agent</h3>
          </div>
          <button type="button" className="agent-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="agent-modal-success-state" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={46} className="success-icon" style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
              Agent Onboarded Successfully!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              <strong>{createdAgent?.agentName}</strong> has been assigned ID <strong>{createdAgent?.bnId}</strong> and added to the Agents List.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="agent-modal-form" style={{ overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
            {error && <div className="agent-modal-error">{error}</div>}

            <div className="agent-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
              {/* 1. Agent Name */}
              <div className="agent-form-group">
                <label>Agent Name <span className="req-star">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.agentName}
                  onChange={(e) => {
                    setError('');
                    setFormData({ ...formData, agentName: e.target.value });
                  }}
                  className="agent-form-input"
                  required
                />
              </div>

              {/* 2. BN Associates ID */}
              <div className="agent-form-group">
                <label>BN Associates ID <span className="req-star">*</span></label>
                <input
                  type="text"
                  value={formData.bnId}
                  onChange={(e) => setFormData({ ...formData, bnId: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. BN5266"
                />
              </div>

              {/* 3. Supervisor */}
              <div className="agent-form-group">
                <label>Supervisor</label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. Priyam Kumar Singh"
                />
              </div>

              {/* 4. DRA Certified */}
              <div className="agent-form-group">
                <label>DRA Certified</label>
                <select
                  value={formData.dra}
                  onChange={(e) => setFormData({ ...formData, dra: e.target.value as 'Yes' | 'No' })}
                  className="agent-form-input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Certified)</option>
                </select>
              </div>

              {/* 5. Area */}
              <div className="agent-form-group">
                <label>Area / Branch</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. Ranchi, Dhanbad"
                />
              </div>

              {/* 6. Base Pincode */}
              <div className="agent-form-group">
                <label>Base Pincode</label>
                <input
                  type="text"
                  value={formData.basePincode}
                  onChange={(e) => setFormData({ ...formData, basePincode: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. 834010"
                />
              </div>

              {/* 7. Residence Pincode */}
              <div className="agent-form-group">
                <label>Residence Pincode</label>
                <input
                  type="text"
                  value={formData.residencePincode}
                  onChange={(e) => setFormData({ ...formData, residencePincode: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. 834004"
                />
              </div>

              {/* 8. Experience */}
              <div className="agent-form-group">
                <label>Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="agent-form-input"
                >
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="3 Years">3 Years</option>
                  <option value="4 Years">4 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              {/* 9. Campaign */}
              <div className="agent-form-group">
                <label>Campaign (Optional)</label>
                <input
                  type="text"
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. - or Moneyview_NPA"
                />
              </div>

              {/* 10. ACR */}
              <div className="agent-form-group">
                <label>ACR Target</label>
                <input
                  type="text"
                  value={formData.acr}
                  onChange={(e) => setFormData({ ...formData, acr: e.target.value })}
                  className="agent-form-input"
                  placeholder="e.g. 800 - 1000"
                />
              </div>
            </div>

            {/* Address Details Full Width */}
            <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="agent-form-group">
                <label>Current Address</label>
                <input
                  type="text"
                  placeholder="e.g. Lower Chutia, Ranchi"
                  value={formData.currentAddress}
                  onChange={(e) => handleCurrentAddressChange(e.target.value)}
                  className="agent-form-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="same-address-check"
                  checked={sameAddress}
                  onChange={(e) => handleSameAddressToggle(e.target.checked)}
                  style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="same-address-check" style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Permanent address is same as current address
                </label>
              </div>

              {!sameAddress && (
                <div className="agent-form-group">
                  <label>Permanent Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Jamudag, Sonahatu, Ranchi"
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    className="agent-form-input"
                  />
                </div>
              )}
            </div>

            <div className="agent-modal-footer" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn-agent-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-agent-submit">
                Onboard Agent
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardAgentModal;
