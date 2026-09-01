import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import './ui.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Global toast state
let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toastQueue: ToastItem[] = [];

function notifyListeners() {
  toastListeners.forEach(fn => fn([...toastQueue]));
}

export const toast = {
  success: (message: string, duration = 4000) => {
    const t: ToastItem = { id: Date.now().toString(), message, type: 'success', duration };
    toastQueue.push(t);
    notifyListeners();
  },
  error: (message: string, duration = 5000) => {
    const t: ToastItem = { id: Date.now().toString(), message, type: 'error', duration };
    toastQueue.push(t);
    notifyListeners();
  },
  warning: (message: string, duration = 4000) => {
    const t: ToastItem = { id: Date.now().toString(), message, type: 'warning', duration };
    toastQueue.push(t);
    notifyListeners();
  },
  info: (message: string, duration = 4000) => {
    const t: ToastItem = { id: Date.now().toString(), message, type: 'info', duration };
    toastQueue.push(t);
    notifyListeners();
  },
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem[]) => setToasts(t);
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  const dismiss = useCallback((id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notifyListeners();
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItemComponent({ toast: t, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), t.duration || 4000);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onDismiss]);

  return (
    <div className={`toast-item toast-${t.type}`}>
      <span className="toast-icon">{icons[t.type]}</span>
      <span className="toast-message">{t.message}</span>
      <button className="toast-dismiss" onClick={() => onDismiss(t.id)}>
        <X size={14} />
      </button>
    </div>
  );
}
