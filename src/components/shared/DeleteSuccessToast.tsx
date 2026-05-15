"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ToastContainer, useToast } from "@/components/ui/Toast";

export default function DeleteSuccessToast() {
  const searchParams = useSearchParams();
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      addToast("Laporan berhasil dihapus.", "success");
      
      // Clean up URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("deleted");
      window.history.replaceState({}, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}
