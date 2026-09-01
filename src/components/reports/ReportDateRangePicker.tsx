import React, { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface ReportDateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onChange?: (start: string, end: string) => void;
  label?: string;
}

export const ReportDateRangePicker: React.FC<ReportDateRangePickerProps> = ({
  startDate = '2026-08-31',
  endDate = '2026-08-31',
  onChange,
  label,
}) => {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  const handleStartChange = (val: string) => {
    setStart(val);
    if (onChange) onChange(val, end);
  };

  const handleEndChange = (val: string) => {
    setEnd(val);
    if (onChange) onChange(start, val);
  };

  return (
    <div className="report-datepicker-wrapper">
      {label && <span className="report-datepicker-label">{label}</span>}
      <div className="report-datepicker-box">
        <Calendar size={15} className="report-datepicker-icon" />
        <input
          type="date"
          className="report-date-input"
          value={start}
          onChange={(e) => handleStartChange(e.target.value)}
        />
        <ArrowRight size={13} className="report-date-arrow" />
        <input
          type="date"
          className="report-date-input"
          value={end}
          onChange={(e) => handleEndChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ReportDateRangePicker;
