import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';
import ReportDateRangePicker from '../../components/reports/ReportDateRangePicker';
import ReportTableEmptyState from '../../components/reports/ReportTableEmptyState';
import { mockWhatsAppMessages, type WhatsAppMessageItem } from '../../data/reportsData';

export const WhatsAppMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages] = useState<WhatsAppMessageItem[]>(mockWhatsAppMessages);
  const [startDate, setStartDate] = useState('2026-08-31');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    showToast('Filtered to Today');
  };

  return (
    <div className="reports-subpage-root whatsapp-page-root">
      {toastMessage && (
        <div className="report-toast-pill">
          <CheckCircle2 size={16} className="text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Row with Back Button */}
      <div className="whatsapp-page-header-row">
        <div className="whatsapp-header-left">
          <button
            type="button"
            className="btn-whatsapp-back"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="whatsapp-title-wrap">
            <h1 className="whatsapp-page-title">WhatsApp Messages</h1>
          </div>
        </div>

        {/* Top Right Filters */}
        <div className="whatsapp-header-right">
          <button
            type="button"
            className="btn-whatsapp-today"
            onClick={handleTodayClick}
          >
            Today
          </button>

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

      {/* Table */}
      <div className="report-table-card">
        <div className="report-table-scroll">
          <table className="report-data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '160px' }}>Name</th>
                <th style={{ minWidth: '150px' }}>Account No.</th>
                <th style={{ minWidth: '140px' }}>Phone Number</th>
                <th style={{ minWidth: '140px' }}>Product</th>
                <th style={{ minWidth: '110px' }}>Bucket</th>
                <th style={{ minWidth: '130px' }}>Allocator</th>
                <th style={{ minWidth: '130px' }}>Outstanding</th>
                <th style={{ minWidth: '120px' }}>Date</th>
                <th style={{ minWidth: '90px' }}>Time</th>
                <th style={{ minWidth: '110px' }}>Status</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map((row) => (
                  <tr key={row.id} className="report-table-row">
                    <td>{row.name}</td>
                    <td>{row.accountNo}</td>
                    <td>{row.phoneNumber}</td>
                    <td>{row.product}</td>
                    <td>{row.bucket}</td>
                    <td>{row.allocator}</td>
                    <td>{row.outstanding}</td>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                    <td>{row.status}</td>
                    <td style={{ textAlign: 'center' }}>-</td>
                  </tr>
                ))
              ) : (
                <ReportTableEmptyState colSpan={11} message="No data" />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessagesPage;
