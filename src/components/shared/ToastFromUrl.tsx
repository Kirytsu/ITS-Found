"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ToastContainer, useToast } from "@/components/ui/Toast";

export default function ToastFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toasts, addToast, dismiss } = useToast();

  useEffect(() => {
    const msg = searchParams.get("toast");
    if (!msg) return;
    const type = (searchParams.get("toastType") ?? "success") as "success" | "error";
    addToast(decodeURIComponent(msg), type);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastType");
    const newUrl = params.size ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}
