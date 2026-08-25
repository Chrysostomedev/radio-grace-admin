"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; // ms, 0 = no auto-close
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const duration = toast.duration ?? (toast.type === "error" ? 5000 : 3000);

      const newToast: Toast = {
        ...toast,
        id,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      addToast({ type: "success", message, title, duration }),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      addToast({ type: "error", message, title, duration: duration ?? 5000 }),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      addToast({ type: "info", message, title, duration }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      addToast({ type: "warning", message, title, duration }),
    [addToast]
  );

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast, success, error, info, warning }),
    [toasts, addToast, removeToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-3 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const bgColor = {
    success: "bg-[#1E9D55]/95 border-[#1E9D55]",
    error: "bg-red-600/95 border-red-600",
    warning: "bg-amber-600/95 border-amber-600",
    info: "bg-blue-600/95 border-blue-600",
  };

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[toast.type];

  return (
    <div
      className={`${bgColor[toast.type]} border rounded-xl p-4 text-white shadow-lg animate-in slide-in-from-right-full duration-300 flex items-start gap-3`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-bold text-sm mb-1">{toast.title}</p>}
        <p className="text-sm leading-relaxed break-words">{toast.message}</p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onRemove();
            }}
            className="mt-2 text-xs font-semibold underline hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 hover:opacity-70 transition"
      >
        <X size={18} />
      </button>
    </div>
  );
}