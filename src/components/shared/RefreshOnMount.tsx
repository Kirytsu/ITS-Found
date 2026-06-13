"use client";
/**
 * src/components/shared/RefreshOnMount.tsx
 * Triggers a router refresh once on mount, refetching server data
 * (e.g. layout-computed unread notification count) without a full reload.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RefreshOnMount() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
