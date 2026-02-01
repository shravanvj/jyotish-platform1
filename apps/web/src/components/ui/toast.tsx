'use client';

import * as React from 'react';
import { createContext, useContext, useReducer, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
} | null>(null);

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({ type: 'ADD_TOAST', payload: { ...toast, id } });

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Container Component
function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-5',
        colors[toast.type]
      )}
    >
      <span className="text-lg shrink-0">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground">{toast.title}</h4>
        {toast.message && (
          <p className="mt-1 text-xs text-muted-foreground">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );
}

export function useErrorToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message });
    },
    [addToast]
  );
}
