import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = '560px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="agent-modal-backdrop" onClick={onClose}>
      <div
        className="agent-modal-dialog"
        style={{ maxWidth, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="agent-modal-header">
            <div className="agent-modal-title-wrap">
              {icon && <span className="agent-modal-icon">{icon}</span>}
              <h3 className="agent-modal-title">{title}</h3>
            </div>
            <button type="button" className="agent-modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        )}

        <div style={{ overflowY: 'auto', padding: '1.25rem 1.5rem', flex: 1 }}>
          {children}
        </div>

        {footer && (
          <div className="agent-modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
