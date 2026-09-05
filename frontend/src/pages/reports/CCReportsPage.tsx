import React, { useState, useMemo } from 'react';
import { Search, Download, RotateCcw, CheckCircle2, FileText, PhoneCall, BarChart2, MessageSquare } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import { mockCCDownloads, type CCReportDownloadItem } from '../../data/reportsData';

export const CCReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Call Log Reports' | 'APR Reports' | 'Allocation File Reports' | 'WhatsApp Reports'>('Call Log Reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadsList, setDownloadsList] = useState<CCReportDownloadItem[]>(mockCCDownloads);
  const [startDate, setStartDate] = useState('2026-08-30');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReset = () => {
    setStartDate('2026-08-30');
    setEndDate('2026-08-30');
    setSearchQuery('');
    showToast('Filters reset to default');
  };

  const handleDownloadReport = () => {
    const newEntry: CCReportDownloadItem = {
      id: `cc-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      requestedBy: 'Priyam kumar singh',
      dateRange: `${startDate} to ${endDate}`,
      allocator: 'Moneyview',
      status: 'SUCCESS',
      fileSize: '156.4 KB',
    };
    setDownloadsList((prev) => [newEntry, ...prev]);
    showToast(`Generated and downloaded ${activeTab}!`);
  };

  const filteredDownloads = useMemo(() => {
    if (!searchQuery.trim()) return downloadsList;
    const q = searchQuery.toLowerCase();
    return downloadsList.filter(
      (d) =>
        d.requestedBy.toLowerCase().includes(q) ||
        d.allocator.toLowerCase().includes(q) ||
        d.date.toLowerCase().includes(q)
    );
  }, [downloadsList, searchQuery]);

  return (
    <div className="reports-subpage-root">
      {toastMessage && (
        <div className="report-toast-pill">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Horizontal Tabs */}
      <div className="report-horizontal-tabs-wrap">
        {[
          { label: 'Call Log Reports', icon: <PhoneCall size={14} /> },
          { label: 'APR Reports', icon: <BarChart2 size={14} /> },
          { label: 'Allocation File Reports', icon: <FileText size={14} /> },
          { label: 'WhatsApp Reports', icon: <MessageSquare size={14} /> },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`report-tab-btn ${activeTab === tab.label ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.label as any)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
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
              onClick={handleDownloadReport}
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

      {/* Downloads Table */}
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
              {filteredDownloads.length > 0 ? (
                filteredDownloads.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>
                      <span className="report-cell-date">{row.date}</span>
                    </td>
                    <td>
                      <span className="report-cell-text font-medium">{row.requestedBy}</span>
                    </td>
                    <td>
                      <span className="report-cell-date-range">{row.dateRange}</span>
                    </td>
                    <td>
                      <span className="report-cell-allocator">{row.allocator}</span>
                    </td>
                    <td>
                      <span className="report-status-badge success">
                        {row.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-table-download-icon"
                        onClick={() => showToast(`Downloading report file (${row.fileSize || 'CSV'})...`)}
                        title="Download file"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={6} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CCReportsPage;
