import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Types
interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    toasts: context.toasts,
    toast: context.addToast,
    dismiss: context.removeToast,
    dismissAll: context.removeAllToasts,
  };
}

// Individual Toast Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove();
        toast.onClose?.();
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const icons = {
    default: null,
    success: (
      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const variantClasses = {
    default: 'bg-background border',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md rounded-lg shadow-lg ring-1 ring-black ring-opacity-5',
        'animate-in slide-in-from-right duration-300',
        variantClasses[toast.variant || 'default']
      )}
    >
      <div className="flex w-0 flex-1 items-center p-4">
        {icons[toast.variant || 'default'] && (
          <div className="flex-shrink-0">
            {icons[toast.variant || 'default']}
          </div>
        )}
        <div className={cn('ml-3 flex-1', !icons[toast.variant || 'default'] && 'ml-0')}>
          {toast.title && (
            <p className="text-sm font-medium text-foreground">
              {toast.title}
            </p>
          )}
          {toast.description && (
            <p className={cn(
              'text-sm text-muted-foreground',
              toast.title && 'mt-1'
            )}>
              {toast.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove();
            }}
            className="flex-shrink-0 rounded-md px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={onRemove}
          className="ml-2 inline-flex rounded-md p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Container Component
function ToastContainer() {
  const context = useContext(ToastContext);
  if (!context || context.toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-end p-4 sm:p-6">
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {context.toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => context.removeToast(toast.id)}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}

// Utility functions for common toast types
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext);
    return context?.addToast({ ...options, title, description, variant: 'success' });
  },
  error: (title: string, description?: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext);
    return context?.addToast({ ...options, title, description, variant: 'error' });
  },
  warning: (title: string, description?: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext);
    return context?.addToast({ ...options, title, description, variant: 'warning' });
  },
  info: (title: string, description?: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext);
    return context?.addToast({ ...options, title, description, variant: 'info' });
  },
};

// Notification component (standalone, no provider needed)
interface NotificationProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration?: number;
}

export function Notification({
  show,
  onClose,
  title,
  description,
  variant = 'default',
  position = 'bottom-right',
  duration = 5000,
}: NotificationProps) {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const animationClasses = {
    'top-left': 'slide-in-from-left',
    'top-center': 'slide-in-from-top',
    'top-right': 'slide-in-from-right',
    'bottom-left': 'slide-in-from-left',
    'bottom-center': 'slide-in-from-bottom',
    'bottom-right': 'slide-in-from-right',
  };

  return createPortal(
    <div
      className={cn(
        'fixed z-50 w-full max-w-sm',
        positionClasses[position],
        `animate-in ${animationClasses[position]} duration-300`
      )}
    >
      <ToastItem
        toast={{ id: 'notification', title, description, variant, duration: 0 }}
        onRemove={onClose}
      />
    </div>,
    document.body
  );
}
