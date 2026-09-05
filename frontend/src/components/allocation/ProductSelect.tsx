import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { PRODUCT_OPTIONS, type ProductOption } from '../../data/allocationMockData';

interface ProductSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredOptions = PRODUCT_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (label: string) => {
    onChange(label);
    setIsOpen(false);
    setSearch('');
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
          {value || 'Product'}
        </span>
        <ChevronDown size={16} className={`custom-select-chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="custom-select-search-wrap">
            <Search size={14} className="custom-select-search-icon" />
            <input
              type="text"
              className="custom-select-search-input"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="custom-select-options-list" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value === option.label;
                return (
                  <div
                    key={option.id}
                    className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.label)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="custom-select-check" />}
                  </div>
                );
              })
            ) : (
              <div className="custom-select-no-results">No products found</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
};

export default ProductSelect;
