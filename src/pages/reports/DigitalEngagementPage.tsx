import React, { useState } from 'react';
import { Search, Download, RotateCcw, Send, CheckCircle2 } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import { mockDigitalEngagementDownloads, type CCReportDownloadItem } from '../../data/reportsData';

export const DigitalEngagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadsList, setDownloadsList] = useState<CCReportDownloadItem[]>(mockDigitalEngagementDownloads);
  const [startDate, setStartDate] = useState('2026-08-31');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReset = () => {
    setStartDate('2026-08-31');
    setEndDate('2026-08-31');
    setSearchQuery('');
    showToast('Filters reset');
  };

  const handleDownload = () => {
    const newRow: CCReportDownloadItem = {
      id: `digi-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      requestedBy: 'Priyam kumar singh',
      dateRange: `${startDate} to ${endDate}`,
      allocator: 'Moneyview',
      status: 'SUCCESS',
      fileSize: '84.2 KB',
    };
    setDownloadsList([newRow, ...downloadsList]);
    showToast('Digital Allocation Report downloaded!');
  };

  return (
    <div className="reports-subpage-root">
      {toastMessage && (
        <div className="report-toast-pill">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Tab */}
      <div className="report-single-header-tab">
        <Send size={15} className="text-indigo" />
        <span className="font-semibold">Digital Allocation Reports</span>
      </div>

      {/* Large Filter Card */}
      <div className="report-filter-card">
        <h3 className="report-filter-card-title">Filter and Download Report</h3>

        <div className="report-filter-card-body">
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

          <div className="report-filter-card-actions">
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
      </div>

      {/* All Downloads Section */}
      <div className="report-section-header-row">
        <h2 className="report-section-title">All Downloads</h2>

        <div className="report-search-box-compact">
          <Search size={14} className="report-search-icon" />
          <input
            type="text"
            placeholder="Search reports"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="report-search-input-compact"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="report-table-card">
        <div className="report-table-scroll">
          <table className="report-data-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Date</th>
                <th style={{ width: '220px' }}>Requested by</th>
                <th style={{ minWidth: '280px' }}>Date Range</th>
                <th style={{ width: '160px' }}>Allocator</th>
                <th style={{ width: '140px' }}>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Download</th>
              </tr>
            </thead>
            <tbody>
              {downloadsList.length > 0 ? (
                downloadsList.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>{row.date}</td>
                    <td>{row.requestedBy}</td>
                    <td>{row.dateRange}</td>
                    <td>{row.allocator}</td>
                    <td>
                      <span className="report-status-badge success">{row.status}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-table-download-icon"
                        onClick={() => showToast('Downloading digital engagement file...')}
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={6} message="No data" />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DigitalEngagementPage;
