import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './ui.css';

// Merged Modal - supports both pankaj's size-based API and zeeshan's icon/maxWidth API
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
  disableBackdropClick?: boolean;
  maxWidth?: string;
}

const sizeToMaxWidth: Record<string, string> = {
  sm: '400px',
  md: '560px',
  lg: '800px',
  xl: '1100px',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = 'md',
  footer,
  disableBackdropClick = false,
  maxWidth,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const resolvedMaxWidth = maxWidth || sizeToMaxWidth[size];

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
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current && !disableBackdropClick) onClose(); }}
    >
      <div
        className={`modal-container modal-${size} animate-fade-in`}
        style={{ maxWidth: resolvedMaxWidth, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {icon && <span className="modal-icon">{icon}</span>}
              <h3 className="modal-title">{title}</h3>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        )}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
