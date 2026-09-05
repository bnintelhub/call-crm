import React, { useState, useMemo } from 'react';
import { Search, Download, RotateCcw, CheckCircle2, ChevronDown, FileAudio } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import {
  mockCallRecordingsDownloads,
  mockAllocationFilesList,
  type CallRecordingDownloadItem,
} from '../../data/reportsData';

export const CallRecordingsPage: React.FC = () => {
  const [selectedAllocationFile, setSelectedAllocationFile] = useState('');
  const [startDate, setStartDate] = useState('2026-08-30');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [searchQuery, setSearchQuery] = useState('');
  const [recordingsList, setRecordingsList] = useState<CallRecordingDownloadItem[]>(mockCallRecordingsDownloads);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReset = () => {
    setSelectedAllocationFile('');
    setStartDate('2026-08-30');
    setEndDate('2026-08-30');
    setSearchQuery('');
    showToast('Filters reset');
  };

  const handleDownload = () => {
    const newRecord: CallRecordingDownloadItem = {
      id: `rec-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dateRange: `${startDate} - ${endDate}`,
      allocator: 'Moneyview',
      requestCriteria: selectedAllocationFile ? `File: ${selectedAllocationFile}` : 'All Allocation Files',
      requestedBy: 'Priyam kumar singh',
      status: 'SUCCESS',
      fileSize: '128.45 KB',
    };
    setRecordingsList((prev) => [newRecord, ...prev]);
    showToast('Call Recordings ZIP generated & downloaded!');
  };

  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) return recordingsList;
    const q = searchQuery.toLowerCase();
    return recordingsList.filter(
      (r) =>
        r.requestCriteria.toLowerCase().includes(q) ||
        r.requestedBy.toLowerCase().includes(q) ||
        r.allocator.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q)
    );
  }, [recordingsList, searchQuery]);

  return (
    <div className="reports-subpage-root">
      {toastMessage && (
        <div className="report-toast-pill">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Large Filter Card */}
      <div className="report-filter-card">
        <h3 className="report-filter-card-title">Filter and Download all Call Recordings</h3>

        <div className="report-filter-card-grid">
          {/* Left Field: Allocation File */}
          <div className="report-filter-field-group">
            <label className="report-filter-field-label">Allocation File</label>
            <div className="report-select-wrapper">
              <select
                className="report-select-input"
                value={selectedAllocationFile}
                onChange={(e) => setSelectedAllocationFile(e.target.value)}
              >
                <option value="">Select allocation file</option>
                {mockAllocationFilesList.map((file) => (
                  <option key={file} value={file}>
                    {file}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="report-select-chevron" />
            </div>
          </div>

          {/* Right Field: Date Range */}
          <div className="report-filter-field-group">
            <label className="report-filter-field-label">Date</label>
            <ReportDateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </div>
        </div>

        {/* Card Actions Bottom Right */}
        <div className="report-filter-card-footer">
          <button
            type="button"
            className="btn-report-reset"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            className="btn-report-download-primary"
            onClick={handleDownload}
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* All Downloads Section */}
      <div className="report-section-header-row">
        <h2 className="report-section-title">All Downloads</h2>

        <div className="report-search-box-compact">
          <Search size={14} className="report-search-icon" />
          <input
            type="text"
            placeholder="Search recordings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="report-search-input-compact"
          />
        </div>
      </div>

      {/* Table */}
      <div className="report-table-card">
        <div className="report-table-scroll">
          <table className="report-data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Date</th>
                <th style={{ width: '190px' }}>Date Range</th>
                <th style={{ width: '130px' }}>Allocator</th>
                <th style={{ minWidth: '320px' }}>Request Criteria</th>
                <th style={{ width: '180px' }}>Requested by</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '110px' }}>File Size</th>
                <th style={{ width: '90px', textAlign: 'center' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecordings.length > 0 ? (
                filteredRecordings.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>
                      <span className="report-cell-date">{row.date}</span>
                    </td>
                    <td>
                      <span className="report-cell-date-range">{row.dateRange}</span>
                    </td>
                    <td>
                      <span className="report-cell-allocator">{row.allocator}</span>
                    </td>
                    <td>
                      <span className="report-cell-criteria">{row.requestCriteria}</span>
                    </td>
                    <td>
                      <span className="report-cell-text font-medium">{row.requestedBy}</span>
                    </td>
                    <td>
                      <span className="report-status-badge success">{row.status}</span>
                    </td>
                    <td>
                      <span className="report-cell-size">{row.fileSize}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-table-download-icon"
                        onClick={() => showToast(`Downloading call recordings (${row.fileSize})...`)}
                        title="Download Recording File"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={8} message="No recordings found" />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallRecordingsPage;
