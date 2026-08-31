import React, { useState, useEffect, useRef } from 'react';
import { Radio, X, WifiOff, ShieldCheck } from 'lucide-react';
import { useLiveStatusStore } from '../../store/liveStatusStore';

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

  const { isLive, setLive, liveSince } = useLiveStatusStore();
  const [sessionDuration, setSessionDuration] = useState('00:00:00');

  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    if (isOpen) {
      if (onToggleExternal) {
        onToggleExternal();
      } else {
        setInternalOpen(false);
      }
    }
  };

  const handleToggle = () => {
    if (onToggleExternal) {
      onToggleExternal();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  // Close when user taps / clicks anywhere outside on the screen
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isLive && liveSince) {
      timer = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(liveSince).getTime()) / 1000);
        const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        setSessionDuration(`${hrs}:${mins}:${secs}`);
      }, 1000);
    } else {
      setSessionDuration('00:00:00');
    }
    return () => clearInterval(timer);
  }, [isLive, liveSince]);

  const handleGoLiveClick = () => {
    setLive(true);
  };

  const handleGoOfflineClick = () => {
    setLive(false);
  };

  return (
    <>
      {/* Go Live Modal / Popover Card */}
      {isOpen && (
        <div ref={popupRef} className="alloc-support-popup live-controller-popup">
          {/* Header */}
          <div className="alloc-support-header">
            <div className="alloc-support-header-info">
              <div className={`alloc-support-avatar ${isLive ? 'live-active-avatar' : ''}`}>
                <Radio size={18} className={isLive ? 'pulse-icon' : ''} />
              </div>
              <div>
                <h4 className="alloc-support-title">Agent Live Status</h4>
                <span className="alloc-support-subtitle">
                  {isLive ? 'Ready & Active for Incoming Calls' : 'Currently Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="alloc-support-body">
            {/* Status Hero Card */}
            <div className={`live-status-hero-card ${isLive ? 'is-live' : 'is-offline'}`}>
              <div className="live-status-hero-top">
                <div className="live-status-hero-indicator">
                  <span className={`live-status-dot ${isLive ? 'pulsing-green' : 'gray-dot'}`} />
                  <span className="live-status-hero-badge">
                    {isLive ? 'LIVE ON CALL QUEUE' : 'OFFLINE'}
                  </span>
                </div>
                {isLive && (
                  <span className="live-timer-chip">
                    Session: {sessionDuration}
                  </span>
                )}
              </div>

              <h3 className="live-status-hero-heading">
                {isLive ? 'You are Live!' : 'Ready to take calls?'}
              </h3>
              <p className="live-status-hero-desc">
                {isLive
                  ? 'Your extension is online in active campaign queues. Incoming calls and auto-dialer leads will route directly to you.'
                  : 'Tap Go Live to connect your extension, join the dialing pool, and start receiving customer calls.'}
              </p>

              {/* Action Button: Go Live / Go Offline */}
              <div className="live-status-action-row">
                {!isLive ? (
                  <button
                    type="button"
                    className="btn-go-live-primary"
                    onClick={handleGoLiveClick}
                  >
                    <Radio size={16} className="btn-icon-pulse" />
                    <span>Go Live</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-go-offline-secondary"
                    onClick={handleGoOfflineClick}
                  >
                    <WifiOff size={15} />
                    <span>Go Offline</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="alloc-support-footer live-controller-footer">
            <span className="footer-status-text">
              <ShieldCheck size={13} className="text-success" />
              {isLive ? 'Real-time sync: Active Telecaller' : 'Telecaller Portal: Standby Mode'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Button with Live indicator */}
      <button
        ref={buttonRef}
        type="button"
        className={`alloc-floating-support-btn ${isLive ? 'btn-is-live' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label="Agent Live Status Controller"
        title={isLive ? 'Agent Status: LIVE (Tap to manage)' : 'Tap to Go Live'}
      >
        {isOpen ? (
          <X size={22} strokeWidth={2.5} />
        ) : isLive ? (
          <Radio size={22} className="floating-live-icon pulse-icon" />
        ) : (
          <Radio size={22} />
        )}
        {isLive && <span className="floating-live-badge-dot" />}
      </button>
    </>
  );
};

export default FloatingSupport;
