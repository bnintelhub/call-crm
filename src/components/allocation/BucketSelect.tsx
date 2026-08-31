import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { BUCKET_OPTIONS, type BucketOption } from '../../data/allocationMockData';

interface BucketSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export const BucketSelect: React.FC<BucketSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (label: string) => {
    onChange(label);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''} ${error ? 'has-error' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {value || 'Bucket'}
        </span>
        <ChevronDown size={16} className={`custom-select-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="custom-select-options-list" role="listbox">
            {BUCKET_OPTIONS.map((option) => {
              const isSelected = value === option.label;
              return (
                <div
                  key={option.id}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.label)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="bucket-option-content">
                    <span className="bucket-option-label">{option.label}</span>
                    {option.dpdRange && (
                      <span className="bucket-option-tag">{option.dpdRange}</span>
                    )}
                  </div>
                  {isSelected && <Check size={14} className="custom-select-check" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
};

export default BucketSelect;
