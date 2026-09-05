import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, User, Briefcase, Edit2, ShieldAlert } from 'lucide-react';
import type { AgentItem } from '../../data/agentMockData';

interface AgentTableRowProps {
  agent: AgentItem;
  onActionClick?: (action: string, agent: AgentItem) => void;
}

export const AgentTableRow: React.FC<AgentTableRowProps> = ({
  agent,
  onActionClick,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    if (onActionClick) {
      onActionClick(action, agent);
    }
  };

  return (
    <tr className="agent-table-row">
      {/* 1. Agent Name */}
      <td className="agent-cell-name">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span className="agent-name-text" title={agent.agentName}>
            {agent.agentName}
          </span>
          <span style={{
            fontSize: '0.65rem',
            padding: '0.1rem 0.375rem',
            borderRadius: '9999px',
            fontWeight: 600,
            background: agent.type === 'FIELD' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            color: agent.type === 'FIELD' ? '#10b981' : '#818cf8',
            border: agent.type === 'FIELD' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)',
          }}>
            {agent.type}
          </span>
        </div>
      </td>

      {/* 2. Supervisor */}
      <td className="agent-cell-supervisor">
        <span>{agent.supervisor}</span>
      </td>

      {/* 3. BN Associates ID */}
      <td className="agent-cell-id">
        <span className="agent-id-pill">{agent.bnId}</span>
      </td>

      {/* 4. DRA */}
      <td className="agent-cell-dra">
        <span className={`agent-dra-badge ${agent.dra === 'Yes' ? 'dra-yes' : 'dra-no'}`}>
          {agent.dra}
        </span>
      </td>

      {/* 5. Area */}
      <td className="agent-cell-area">
        <span>{agent.area}</span>
      </td>

      {/* 6. Base Pincode */}
      <td className="agent-cell-pincode">
        <span>{agent.basePincode}</span>
      </td>

      {/* 7. Residence Pincode */}
      <td className="agent-cell-pincode">
        <span>{agent.residencePincode}</span>
      </td>

      {/* 8. Current Address */}
      <td className="agent-cell-address">
        <span className="agent-address-text" title={agent.currentAddress}>
          {agent.currentAddress}
        </span>
      </td>

      {/* 9. Permanent Address */}
      <td className="agent-cell-address">
        <span className="agent-address-text" title={agent.permanentAddress}>
          {agent.permanentAddress}
        </span>
      </td>

      {/* 10. Experience */}
      <td className="agent-cell-experience">
        <span>{agent.experience}</span>
      </td>

      {/* 11. Campaign */}
      <td className="agent-cell-campaign">
        <span>{agent.campaign}</span>
      </td>

      {/* 12. ACR */}
      <td className="agent-cell-acr">
        <span>{agent.acr}</span>
      </td>

      {/* 13. Action */}
      <td className="agent-cell-action">
        <div className="agent-action-wrap" ref={menuRef}>
          <button
            type="button"
            className="agent-action-trigger"
            onClick={() => setShowMenu(!showMenu)}
            title="Options"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="agent-action-dropdown">
              <button
                type="button"
                className="agent-action-menu-item"
                onClick={() => handleMenuAction('view')}
              >
                <User size={14} />
                <span>View Profile</span>
              </button>
              <button
                type="button"
                className="agent-action-menu-item"
                onClick={() => handleMenuAction('assign')}
              >
                <Briefcase size={14} />
                <span>Assign Campaign</span>
              </button>
              <button
                type="button"
                className="agent-action-menu-item"
                onClick={() => handleMenuAction('edit')}
              >
                <Edit2 size={14} />
                <span>Edit Details</span>
              </button>
              <div className="agent-action-divider" />
              <button
                type="button"
                className="agent-action-menu-item item-danger"
                onClick={() => handleMenuAction('deactivate')}
              >
                <ShieldAlert size={14} />
                <span>Deactivate</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AgentTableRow;
