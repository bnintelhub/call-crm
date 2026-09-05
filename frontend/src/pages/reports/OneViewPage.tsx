import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, Download, Eye, FileText, CheckCircle2 } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import { mockOneViewReports, type OneViewItem } from '../../data/reportsData';

export const OneViewPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports] = useState<OneViewItem[]>(mockOneViewReports);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.allocationName.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.bucket.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  return (
    <div className="reports-subpage-root">
      {toastMessage && (
        <div className="report-toast-pill">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="report-page-header">
        <h1 className="report-page-title">All Reports</h1>
        <p className="report-page-subtitle">
          Download reports from different channels to track performance
        </p>
      </div>

      {/* Top Filter Row */}
      <div className="report-top-filter-row">
        <div className="report-filter-left">
          <ReportDateRangePicker />
        </div>

        <div className="report-filter-right">
          <div className="report-search-box-large">
            <Search size={15} className="report-search-icon" />
            <input
              type="text"
              placeholder="Search Allocations, Bucket, Product, Channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="report-search-input-large"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="report-table-card">
        <div className="report-table-scroll">
          <table className="report-data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '320px' }}>Allocation Name</th>
                <th style={{ width: '180px' }}>Product</th>
                <th style={{ width: '140px' }}>Bucket</th>
                <th style={{ width: '130px' }}>Channel</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>
                      <span className="report-cell-alloc-name">{row.allocationName}</span>
                    </td>
                    <td>
                      <span className="report-cell-text">{row.product}</span>
                    </td>
                    <td>
                      <span className={`report-bucket-tag ${row.bucket.toLowerCase().replace(/\s+/g, '-')}`}>
                        {row.bucket}
                      </span>
                    </td>
                    <td>
                      <span className="report-cell-channel">{row.channel}</span>
                    </td>
                    <td style={{ textAlign: 'center', position: 'relative' }}>
                      <button
                        type="button"
                        className="report-action-menu-btn"
                        onClick={() =>
                          setActiveMenuId(activeMenuId === row.id ? null : row.id)
                        }
                        title="Actions"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === row.id && (
                        <div className="report-dropdown-menu-pop">
                          <button
                            type="button"
                            className="report-dropdown-item"
                            onClick={() => {
                              showToast(`Downloading report for ${row.product}...`);
                              setActiveMenuId(null);
                            }}
                          >
                            <Download size={14} />
                            <span>Download CSV</span>
                          </button>
                          <button
                            type="button"
                            className="report-dropdown-item"
                            onClick={() => {
                              showToast(`Viewing details of ${row.allocationName}`);
                              setActiveMenuId(null);
                            }}
                          >
                            <Eye size={14} />
                            <span>View Summary</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={5} />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OneViewPage;
