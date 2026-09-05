import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, RefreshCw, X, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { SYSTEM_COLUMNS, type SystemColumn } from '../../utils/allocationDataMapping';

interface DataMappingUIProps {
  fileHeaders: string[];
  onConfirm: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

export const DataMappingUI: React.FC<DataMappingUIProps> = ({ fileHeaders, onConfirm, onCancel }) => {
  // mapping state: Record<SystemColumnKey, FileHeaderName>
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [missingRequired, setMissingRequired] = useState<string[]>([]);
  
  useEffect(() => {
    const ALIASES: Record<string, string[]> = {
      loan_number: ['loan_application', 'loan_applic', 'account_number', 'acc_no', 'loan_id', 'account', 'loan_no', 'loan'],
      borrower_name: ['name', 'customer_name', 'client_name', 'customer', 'borrower'],
      phone_number: ['mobile', 'contact', 'phone', 'cell', 'mobile_no', 'contact_no'],
      phone_number_alt: ['alt_mobile', 'alternate_number', 'alt_phone', 'alt_contact'],
      total_due_amount: ['target_amt', 'target_amount', 'due_amount', 'total_due', 'amount', 'outstanding'],
      principal_outstanding: ['pos', 'principal', 'principal_amt'],
      email: ['email_id', 'mail'],
      pincode: ['pin', 'zip', 'zipcode', 'pin_code'],
      state: ['region'],
    };

    const initialMapping: Record<string, string> = {};

    SYSTEM_COLUMNS.forEach((sysCol) => {
      // 1. Direct exact match (case insensitive, without spaces/underscores)
      const cleanSysName = sysCol.key.replace(/[_]/g, '').toLowerCase();
      const exactMatch = fileHeaders.find(h => h.replace(/[_\s]/g, '').toLowerCase() === cleanSysName);
      
      if (exactMatch) {
        initialMapping[sysCol.key] = exactMatch;
        return;
      }

      // 2. Alias match
      if (ALIASES[sysCol.key]) {
        for (const alias of ALIASES[sysCol.key]) {
          const aliasMatch = fileHeaders.find(h => h.replace(/[_\s]/g, '').toLowerCase() === alias.replace(/[_]/g, '').toLowerCase());
          if (aliasMatch) {
            initialMapping[sysCol.key] = aliasMatch;
            return;
          }
        }
      }

      // 3. Fallback to includes match for very obvious ones
      const sysKeyClean = cleanSysName;
      const includesMatch = fileHeaders.find(h => {
        const cleanH = h.replace(/[_\s]/g, '').toLowerCase();
        return cleanH.includes(sysKeyClean) || sysKeyClean.includes(cleanH);
      });
      
      if (includesMatch && sysKeyClean.length > 4) {
        // Only do includes match if the word is substantial (>4 chars) to avoid bad matches
        initialMapping[sysCol.key] = includesMatch;
      }
    });

    setMapping(initialMapping);
  }, [fileHeaders]);

  const handleSelectMapping = (sysColKey: string, fileHeader: string) => {
    setMapping(prev => {
      const next = { ...prev };
      if (!fileHeader) {
        delete next[sysColKey];
      } else {
        next[sysColKey] = fileHeader;
      }
      return next;
    });
  };

  const handleConfirm = () => {
    // Validate required columns
    const missing = SYSTEM_COLUMNS.filter(c => c.required && !mapping[c.key]).map(c => c.label);
    if (missing.length > 0) {
      setMissingRequired(missing);
      return;
    }
    setMissingRequired([]);
    onConfirm(mapping);
  };

  const groupedColumns = SYSTEM_COLUMNS.reduce((acc, col) => {
    if (!acc[col.category]) acc[col.category] = [];
    acc[col.category].push(col);
    return acc;
  }, {} as Record<string, SystemColumn[]>);

  const mappedCount = Object.keys(mapping).length;
  const reqMappedCount = SYSTEM_COLUMNS.filter(c => c.required && mapping[c.key]).length;
  const totalReqCount = SYSTEM_COLUMNS.filter(c => c.required).length;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={18} color="var(--accent-primary)" /> Column Mapping
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Match your Excel columns to our system. Auto-mapped using fuzzy logic.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: reqMappedCount === totalReqCount ? '#10b981' : '#f59e0b' }}>
            {reqMappedCount} / {totalReqCount} Required Mapped
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {mappedCount} total columns mapped
          </div>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div style={{ padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444' }}>Missing Required Fields</span>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              Please map the following columns to proceed: {missingRequired.join(', ')}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '1.5rem', maxHeight: '50vh', overflowY: 'auto' }}>
        {Object.entries(groupedColumns).map(([category, columns]) => (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              {category}
            </h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
              {columns.map(col => {
                const isMapped = !!mapping[col.key];
                return (
                  <div key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.375rem', border: `1px solid ${col.required && !isMapped ? '#ef4444' : 'var(--border-color)'}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {col.label}
                        </span>
                        {col.required && <span style={{ color: '#ef4444', fontWeight: '700' }}>*</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{col.key}</div>
                    </div>
                    
                    <ArrowRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    
                    <div style={{ flex: 1 }}>
                      <select
                        value={mapping[col.key] || ''}
                        onChange={(e) => handleSelectMapping(col.key, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: '0.25rem', background: isMapped ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)', outline: 'none' }}
                      >
                        <option value="">-- Ignored --</option>
                        {fileHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
        <button 
          onClick={onCancel}
          style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.375rem', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <X size={16} /> Cancel Upload
        </button>
        <button 
          onClick={handleConfirm}
          style={{ padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          Confirm Mapping & Process <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DataMappingUI;
