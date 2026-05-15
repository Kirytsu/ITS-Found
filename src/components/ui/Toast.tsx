"use client";
/**
 * src/components/ui/Toast.tsx
 * Notification toast — auto-dismisses, supports 4 types.
 * Use the useToast hook to trigger programmatically.
 */
import { useEffect, useState } from "react";
import { CheckCircle, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // ms, default 4000
}

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const typeConfig: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    classes: "bg-teal-50 border-teal-300 text-teal-800",
  },
  info: {
    icon: <Info size={18} />,
    classes: "bg-blue-50 border-blue-300 text-blue-800",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    classes: "bg-yellow-50 border-yellow-300 text-yellow-800",
  },
  error: {
    icon: <XCircle size={18} />,
    classes: "bg-red-50 border-red-300 text-red-800",
  },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { icon, classes } = typeConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md text-sm font-medium",
        "animate-in slide-in-from-top-2 duration-300",
        classes
      )}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <p className="flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* ── Toast Container (render at the top of the page) ── */
interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ── useToast hook ── */
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: ToastType = "info", duration?: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, dismiss };
}
