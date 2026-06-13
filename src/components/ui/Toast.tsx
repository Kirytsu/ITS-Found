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

const typeConfig: Record<
  ToastType,
  { icon: React.ReactNode; chip: string; border: string; title: string }
> = {
  success: {
    icon: <CheckCircle size={18} />,
    chip: "bg-brand-50 text-brand-600",
    border: "border-brand-100",
    title: "Berhasil",
  },
  info: {
    icon: <Info size={18} />,
    chip: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
    title: "Info",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    chip: "bg-amber-50 text-amber-600",
    border: "border-amber-100",
    title: "Perhatian",
  },
  error: {
    icon: <XCircle size={18} />,
    chip: "bg-red-50 text-red-600",
    border: "border-red-100",
    title: "Gagal",
  },
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { icon, chip, border, title } = typeConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={clsx(
        "animate-pop-in flex items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-lg shadow-gray-900/5",
        border
      )}
    >
      <span className={clsx("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full", chip)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-gray-600 break-words">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Tutup"
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
