import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

/**
 * Toast Context for managing notifications
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use Toast notifications
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * Toast Provider component - wrap your app with this
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;

      const newToast: ToastMessage = {
        id,
        type,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Individual Toast Item Component
 */
interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          icon: 'text-green-400',
          text: 'text-green-100',
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          text: 'text-red-100',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          icon: 'text-yellow-400',
          text: 'text-yellow-100',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          text: 'text-blue-100',
        };
      default:
        return {
          bg: 'bg-slate-500/20',
          border: 'border-slate-500/30',
          icon: 'text-slate-400',
          text: 'text-slate-100',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-from-right`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>{getIcon()}</div>
      <p className={`flex-1 ${styles.text} text-sm`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toast Container - displays all toast notifications
 */
interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}

export default ToastProvider;
