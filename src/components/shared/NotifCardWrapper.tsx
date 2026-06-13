"use client";
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "@/lib/actions/notification.actions";

interface Props {
  notifId: string;
  href: string | null;
  isRead: boolean;
  className: string;
  children: React.ReactNode;
}

export default function NotifCardWrapper({ notifId, href, isRead, className, children }: Props) {
  const router = useRouter();

  const handleClick = async () => {
    if (!isRead) {
      await markNotificationAsRead(notifId);
      router.refresh();
    }
    if (href) router.push(href);
  };

  return (
    <div
      onClick={href || !isRead ? handleClick : undefined}
      className={`${className}${href ? " cursor-pointer" : ""}`}
    >
      {children}
    </div>
  );
}
