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
  card: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  labelKey: string;
}

function getMeta(actionKey: string): Meta {
  switch (actionKey) {
    case "claimCancelled":
    case "reportDeleted":
      return {
        card: "bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800/40",
        icon: actionKey === "reportDeleted" ? Trash2 : XCircle,
        iconBg: "bg-red-100 dark:bg-red-900/60",
        iconColor: "text-red-600 dark:text-red-400",
        labelKey: actionKey === "reportDeleted" ? "notif.action.reportDeleted" : "notif.action.claimCancelled",
      };
    case "readyPickup":
    case "verified":
      return {
        card: "bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800/40",
        icon: CheckCircle2,
        iconBg: "bg-green-100 dark:bg-green-900/60",
        iconColor: "text-green-600 dark:text-green-400",
        labelKey: actionKey === "verified" ? "notif.action.verified" : "notif.action.readyPickup",
      };
    case "claimSubmitted":
    case "claimToResolve":
    case "reportCreatedLost":
      return {
        card: "bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800/40",
        icon: actionKey === "reportCreatedLost" ? PlusCircle : Clock,
        iconBg: "bg-orange-100 dark:bg-orange-900/60",
        iconColor: "text-orange-600 dark:text-orange-400",
        labelKey: `notif.action.${actionKey}`,
      };
    case "reportEdited":
      return {
        card: "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800/40",
        icon: Pencil,
        iconBg: "bg-blue-100 dark:bg-blue-900/60",
        iconColor: "text-blue-600 dark:text-blue-400",
        labelKey: "notif.action.reportEdited",
      };
    default:
      return {
        card: "bg-brand-50 dark:bg-brand-100/60 border-brand-200 dark:border-brand-200/30",
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
  const report = notif.matchedReport;

  return (
    <div
      className={`fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl
        transition-all duration-300 animate-in fade-in slide-in-from-top-2
        ${meta.card}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
        <Icon size={16} className={meta.iconColor} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-900 leading-snug">
          {t(meta.labelKey)}
        </p>
        {report && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{report.title}</p>
        )}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="shrink-0 p-0.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
