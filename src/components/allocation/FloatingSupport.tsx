import React, { useState } from 'react';
import { Headphones, X, MessageSquare, Phone, BookOpen, ExternalLink } from 'lucide-react';

interface FloatingSupportProps {
  isOpenExternal?: boolean;
  onToggleExternal?: () => void;
}

export const FloatingSupport: React.FC<FloatingSupportProps> = ({
  isOpenExternal,
  onToggleExternal,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  const handleToggle = () => {
    if (onToggleExternal) {
      onToggleExternal();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <>
      {/* Floating Support Modal / Popup Card */}
      {isOpen && (
        <div className="alloc-support-popup">
          <div className="alloc-support-header">
            <div className="alloc-support-header-info">
              <div className="alloc-support-avatar">
                <Headphones size={18} />
              </div>
              <div>
                <h4 className="alloc-support-title">BN Associates Support</h4>
                <span className="alloc-support-subtitle">We are here to assist you</span>
              </div>
            </div>
            <button
              type="button"
              className="alloc-support-close"
              onClick={handleToggle}
              title="Close support"
            >
              <X size={16} />
            </button>
          </div>

          <div className="alloc-support-body">
            <p className="alloc-support-intro">
              Have questions regarding data allocation, file upload formats, or daily settlement?
            </p>

            <div className="alloc-support-links">
              <div className="alloc-support-item">
                <div className="alloc-support-icon-box">
                  <BookOpen size={16} />
                </div>
                <div className="alloc-support-text">
                  <span className="alloc-support-label">Allocation Guidelines</span>
                  <span className="alloc-support-desc">View required Excel/CSV column headers</span>
                </div>
                <ExternalLink size={13} className="alloc-support-arrow" />
              </div>

              <div className="alloc-support-item">
                <div className="alloc-support-icon-box">
                  <MessageSquare size={16} />
                </div>
                <div className="alloc-support-text">
                  <span className="alloc-support-label">Live Chat Support</span>
                  <span className="alloc-support-desc">Instant reply from operations team</span>
                </div>
                <ExternalLink size={13} className="alloc-support-arrow" />
              </div>

              <div className="alloc-support-item">
                <div className="alloc-support-icon-box">
                  <Phone size={16} />
                </div>
                <div className="alloc-support-text">
                  <span className="alloc-support-label">Helpline Desk</span>
                  <span className="alloc-support-desc">+91 80 4567 8900 (Mon–Sat 9AM–7PM)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="alloc-support-footer">
            <span>Powered by BN Associates Ops</span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        className={`alloc-floating-support-btn ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Customer Support"
        title="Help & Support"
      >
        {isOpen ? <X size={22} /> : <Headphones size={22} />}
      </button>
    </>
  );
};

export default FloatingSupport;
