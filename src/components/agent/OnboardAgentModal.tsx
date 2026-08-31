import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import type { AgentItem } from '../../data/agentMockData';

interface OnboardAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentAdded: (newAgent: AgentItem) => void;
}

export const OnboardAgentModal: React.FC<OnboardAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentAdded,
}) => {
  const [formData, setFormData] = useState({
    agentName: '',
    supervisor: 'Priyam Kumar Singh',
    bnId: `BN${Math.floor(5200 + Math.random() * 100)}`,
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

  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agentName.trim()) {
      setError('Agent Name is required');
      return;
    }

    const newAgent: AgentItem = {
      id: `agent-${Date.now()}`,
      ...formData,
      type: 'CALL',
      isOnline: false,
      isAllocated: false,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onAgentAdded(newAgent);
      setIsSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="agent-modal-backdrop">
      <div className="agent-modal-dialog">
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
          <div className="agent-modal-success-state">
            <CheckCircle2 size={42} className="success-icon" />
            <h4>Agent Onboarded Successfully!</h4>
            <p>{formData.agentName} has been added with ID {formData.bnId}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="agent-modal-form">
            {error && <div className="agent-modal-error">{error}</div>}

            <div className="agent-form-grid">
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
                />
              </div>

              <div className="agent-form-group">
                <label>Supervisor</label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                  className="agent-form-input"
                />
              </div>

              <div className="agent-form-group">
                <label>BN Associates ID</label>
                <input
                  type="text"
                  value={formData.bnId}
                  onChange={(e) => setFormData({ ...formData, bnId: e.target.value })}
                  className="agent-form-input"
                />
              </div>

              <div className="agent-form-group">
                <label>DRA Certified</label>
                <select
                  value={formData.dra}
                  onChange={(e) => setFormData({ ...formData, dra: e.target.value as 'Yes' | 'No' })}
                  className="agent-form-input"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="agent-form-group">
                <label>Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="agent-form-input"
                />
              </div>

              <div className="agent-form-group">
                <label>Base Pincode</label>
                <input
                  type="text"
                  value={formData.basePincode}
                  onChange={(e) => setFormData({ ...formData, basePincode: e.target.value })}
                  className="agent-form-input"
                />
              </div>

              <div className="agent-form-group">
                <label>Current Address</label>
                <input
                  type="text"
                  placeholder="e.g. Lower Chutia, Ranchi"
                  value={formData.currentAddress}
                  onChange={(e) => setFormData({ ...formData, currentAddress: e.target.value })}
                  className="agent-form-input"
                />
              </div>

              <div className="agent-form-group">
                <label>Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="agent-form-input"
                />
              </div>
            </div>

            <div className="agent-modal-footer">
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
