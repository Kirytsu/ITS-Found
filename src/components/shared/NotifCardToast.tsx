"use client";
/**
 * Floats a styled notification card (top-right) after a successful action.
 * Detects ?notif=1 in URL, fetches latest notification, auto-dismisses after 4s.
 * Dark mode: only gray palette is inverted; standard color tokens (red/orange/green/blue) are not.
 */
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  X, CheckCircle2, Clock, XCircle, Sparkles,
  PlusCircle, Pencil, Trash2, PackageOpen, type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/shared/LanguageProvider";
import { getLatestUserNotification } from "@/lib/actions/notification.actions";

type Notif = Awaited<ReturnType<typeof getLatestUserNotification>>;

interface Meta {
  accent: string;   // left-border color (type indicator on a solid card)
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  labelKey: string;
}

function getMeta(actionKey: string): Meta {
  switch (actionKey) {
    case "claimCancelled":
    case "claimCancelledSelf":
    case "reportRejected":
    case "reportDeleted":
      return {
        accent: "border-l-red-500",
        icon: actionKey === "reportDeleted" ? Trash2 : XCircle,
        iconBg: "bg-red-100 dark:bg-red-900/60",
        iconColor: "text-red-600 dark:text-red-400",
        labelKey:
          actionKey === "reportDeleted" ? "notif.action.reportDeleted"
          : actionKey === "reportRejected" ? "notif.action.reportRejected"
          : actionKey === "claimCancelledSelf" ? "notif.action.claimCancelledSelf"
          : "notif.action.claimCancelled",
      };
    case "readyPickup":
    case "verified":
    case "reportResolvedSelf":
      return {
        accent: "border-l-green-500",
        icon: CheckCircle2,
        iconBg: "bg-green-100 dark:bg-green-900/60",
        iconColor: "text-green-600 dark:text-green-400",
        labelKey:
          actionKey === "verified" ? "notif.action.verified"
          : actionKey === "reportResolvedSelf" ? "notif.action.reportResolvedSelf"
          : "notif.action.readyPickup",
      };
    case "claimSubmitted":
    case "claimToResolve":
    case "claimMade":
    case "reportCreatedLost":
      return {
        accent: "border-l-orange-500",
        icon: actionKey === "reportCreatedLost" ? PlusCircle : actionKey === "claimMade" ? CheckCircle2 : Clock,
        iconBg: "bg-orange-100 dark:bg-orange-900/60",
        iconColor: "text-orange-600 dark:text-orange-400",
        labelKey: `notif.action.${actionKey}`,
      };
    case "reportEdited":
      return {
        accent: "border-l-blue-500",
        icon: Pencil,
        iconBg: "bg-blue-100 dark:bg-blue-900/60",
        iconColor: "text-blue-600 dark:text-blue-400",
        labelKey: "notif.action.reportEdited",
      };
    default:
      return {
        accent: "border-l-brand-500",
        icon: actionKey === "newFoundReport" ? PackageOpen : actionKey === "reportCreatedFound" ? PlusCircle : Sparkles,
        iconBg: "bg-brand-100 dark:bg-brand-100/60",
        iconColor: "text-brand-600 dark:text-brand-600",
        labelKey:
          actionKey === "newFoundReport" ? "notif.action.newFoundReport"
          : actionKey === "reportCreatedFound" ? "notif.action.reportCreatedFound"
          : "notif.action.match",
      };
  }
}

export default function NotifCardToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const [notif, setNotif] = useState<NonNullable<Notif> | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!searchParams.get("notif")) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("notif");
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });

    getLatestUserNotification().then((n) => {
      if (!n) return;
      setNotif(n);
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible || !notif) return null;

  const meta = getMeta(notif.actionKey);
  const Icon = meta.icon;
  // matchedReport title when present; otherwise the snapshot title (e.g. deleted report)
  const reportTitle = notif.matchedReport?.title ?? notif.title ?? null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] flex items-start gap-3 rounded-2xl
        border border-gray-200 dark:border-gray-200/40 border-l-4 ${meta.accent}
        bg-white dark:bg-gray-100 p-3.5 shadow-xl
        transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
        <Icon size={16} className={meta.iconColor} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-900 leading-snug">
          {t(meta.labelKey)}
        </p>
        {reportTitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{reportTitle}</p>
        )}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="shrink-0 p-0.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        aria-label={t("common.dismiss")}
      >
        <X size={14} />
      </button>
    </div>
  );
}
