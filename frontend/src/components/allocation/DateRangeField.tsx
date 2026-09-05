import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFieldProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string | null;
}

export const DateRangeField: React.FC<DateRangeFieldProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
}) => {
  return (
    <div className="date-range-field-wrap">
      <div className={`date-range-container ${error ? 'has-error' : ''}`}>
        <div className="date-input-box">
          <input
            type="date"
            className="date-native-input"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            aria-label="Start Date"
          />
        </div>

        <span className="date-range-separator">→</span>

        <div className="date-input-box">
          <input
            type="date"
            className="date-native-input"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-label="End Date"
          />
        </div>

        <div className="date-range-icon-box">
          <Calendar size={16} />
        </div>
      </div>

      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
};

export default DateRangeField;
