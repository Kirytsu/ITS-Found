"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { useT } from "@/components/shared/LanguageProvider";

export default function DeleteSuccessToast() {
  const searchParams = useSearchParams();
  const { toasts, addToast, dismiss } = useToast();
  const t = useT();

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      addToast(t("toast.deleteSuccess"), "success");
      
      // Clean up URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("deleted");
      window.history.replaceState({}, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}
