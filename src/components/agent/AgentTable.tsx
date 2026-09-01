import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { AgentItem } from '../../data/agentMockData';
import AgentTableRow from './AgentTableRow';

interface AgentTableProps {
  agents: AgentItem[];
  onActionClick?: (action: string, agent: AgentItem) => void;
}

type SortField = 'agentName' | 'supervisor' | 'bnId' | 'area' | 'experience';

export const AgentTable: React.FC<AgentTableProps> = ({
  agents,
  onActionClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('agentName');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    const comparison = valA.localeCompare(valB);
    return sortAsc ? comparison : -comparison;
  });

  return (
    <div className="agent-table-card">
      <div className="agent-table-scroll-wrapper">
        <table className="agent-data-table">
          <thead>
            <tr>
              {/* 1. Agent Name */}
              <th className="th-agent-name" onClick={() => handleSort('agentName')}>
                <div className="th-cell-content">
                  <span>Agent Name</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 2. Supervisor */}
              <th className="th-agent-supervisor" onClick={() => handleSort('supervisor')}>
                <div className="th-cell-content">
                  <span>Supervisor</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 3. BN Associates ID */}
              <th className="th-agent-id" onClick={() => handleSort('bnId')}>
                <div className="th-cell-content">
                  <span>BN Associates ID</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 4. DRA */}
              <th className="th-agent-dra">
                <div className="th-cell-content">
                  <span>DRA</span>
                </div>
              </th>

              {/* 5. Area */}
              <th className="th-agent-area" onClick={() => handleSort('area')}>
                <div className="th-cell-content">
                  <span>Area</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 6. Base Pincode */}
              <th className="th-agent-pincode">
                <div className="th-cell-content">
                  <span>Base Pincode</span>
                </div>
              </th>

              {/* 7. Residence Pincode */}
              <th className="th-agent-pincode">
                <div className="th-cell-content">
                  <span>Residence Pincode</span>
                </div>
              </th>

              {/* 8. Current Address */}
              <th className="th-agent-address">
                <div className="th-cell-content">
                  <span>Current Address</span>
                </div>
              </th>

              {/* 9. Permanent Address */}
              <th className="th-agent-address">
                <div className="th-cell-content">
                  <span>Permanent Address</span>
                </div>
              </th>

              {/* 10. Experience */}
              <th className="th-agent-exp" onClick={() => handleSort('experience')}>
                <div className="th-cell-content">
                  <span>Experience</span>
                  <ArrowUpDown size={12} className="th-sort-icon" />
                </div>
              </th>

              {/* 11. Campaign */}
              <th className="th-agent-campaign">
                <div className="th-cell-content">
                  <span>Campaign</span>
                </div>
              </th>

              {/* 12. ACR */}
              <th className="th-agent-acr">
                <div className="th-cell-content">
                  <span>ACR</span>
                </div>
              </th>

              {/* 13. Action */}
              <th className="th-agent-action">
                <div className="th-cell-content th-align-center">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedAgents.length > 0 ? (
              sortedAgents.map((agent) => (
                <AgentTableRow
                  key={agent.id}
                  agent={agent}
                  onActionClick={onActionClick}
                />
              ))
            ) : (
              <tr>
                <td colSpan={13} className="agent-empty-cell">
                  <div className="agent-empty-state">
                    <p className="agent-empty-title">No agents found</p>
                    <p className="agent-empty-desc">Try clearing your search query or switching categories</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentTable;
