import React from 'react';
import SearchInput from '../../shared/SearchInput';
import { Download, RotateCw } from 'lucide-react';

interface IVRFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDisposition: string;
  onDispositionChange: (disp: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export const IVRFilters: React.FC<IVRFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedDisposition,
  onDispositionChange,
  onExport,
  onRefresh,
}) => {
  return (
    <div className="agent-table-toolbar" style={{ marginBottom: '1rem' }}>
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search caller, agent or phone..."
      />

      <div className="agent-toolbar-actions">
        <select
          value={selectedDisposition}
          onChange={(e) => onDispositionChange(e.target.value)}
          className="agent-form-input"
          style={{ width: 'auto', padding: '0.45rem 0.75rem' }}
        >
          <option value="ALL">All Dispositions</option>
          <option value="PTP">PTP Agreed</option>
          <option value="CALLBACK">Callback</option>
          <option value="DISPUTE">Dispute</option>
          <option value="PAID">Already Paid</option>
        </select>

        {onRefresh && (
          <button type="button" onClick={onRefresh} className="btn-export-icon" title="Refresh">
            <RotateCw size={15} />
          </button>
        )}

        {onExport && (
          <button type="button" onClick={onExport} className="btn-export-icon" title="Export CSV">
            <Download size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default IVRFilters;
