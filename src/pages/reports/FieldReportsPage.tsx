import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import { mockFieldReports, type OneViewItem } from '../../data/reportsData';

export const FieldReportsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [reports] = useState<OneViewItem[]>(mockFieldReports);

  return (
    <div className="reports-subpage-root">
      {/* Page Header */}
      <div className="report-page-header">
        <h1 className="report-page-title">Field Reports</h1>
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

      {/* Data Table with Empty State */}
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
              {reports.length > 0 ? (
                reports.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>
                      <span className="report-cell-alloc-name">{row.allocationName}</span>
                    </td>
                    <td>{row.product}</td>
                    <td>{row.bucket}</td>
                    <td>{row.channel}</td>
                    <td>-</td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={5} message="No data" />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FieldReportsPage;
