"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsAsRead } from "@/lib/actions/notification.actions";

export default function MarkReadOnMount({ userId, hasUnread }: { userId: string; hasUnread: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasUnread) return;
    markAllNotificationsAsRead(userId).then(() => router.refresh());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
