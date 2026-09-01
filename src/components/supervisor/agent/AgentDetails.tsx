import React from 'react';
import { User, Phone, MapPin, Award, Briefcase, Calendar } from 'lucide-react';
import type { AgentItem } from '../../../types';
import Modal from '../../shared/Modal';

interface AgentDetailsProps {
  agent: AgentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentDetails: React.FC<AgentDetailsProps> = ({ agent, isOpen, onClose }) => {
  if (!agent) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agent Profile Details"
      icon={<User size={20} />}
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {agent.agentName.charAt(0)}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {agent.agentName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className="agent-id-pill">{agent.bnId}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Supervisor: <strong>{agent.supervisor}</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role / Department</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.type} Agent</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DRA Certified</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.dra}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Area / Branch</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.area}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Experience</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.experience}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Address</span>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{agent.currentAddress}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Permanent Address</span>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{agent.permanentAddress}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Campaign</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.campaign}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACR Target</span>
            <p style={{ margin: '0.125rem 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>{agent.acr}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AgentDetails;
