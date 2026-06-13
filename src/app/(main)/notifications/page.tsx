/**
 * src/app/(main)/notifications/page.tsx
 */
import { revalidatePath } from "next/cache";
import {
  Bell, ArrowRight, CheckCircle2, Clock, XCircle, Sparkles,
  MapPin, Tag, PlusCircle, Pencil, Trash2, PackageOpen, type LucideIcon,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import NotifCardWrapper from "@/components/shared/NotifCardWrapper";
import ClearReadButton from "@/components/shared/ClearReadButton";
import { requireSession } from "@/lib/auth";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification.actions";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator, type Translator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const READ_PAGE_SIZE = 20;

interface NotifMeta {
  card: string;
  readCard: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  dot: string;
  labelKey: string;
}

/**
 * Dark mode note: ONLY gray palette is inverted (gray-50=#111, gray-950=#fff).
 * Standard Tailwind color tokens (red/orange/green/blue) NOT inverted — use normally.
 * Brand tokens ARE inverted: brand-100 dark=#14254d (navy), brand-900 dark=#dde8fe (light).
 *
 * Unread cards: colored bg per type. Read cards: gray regardless of original type.
 */
function getNotifMeta(actionKey: string): NotifMeta {
  const readCard = "bg-gray-50 dark:bg-gray-100/80 border-gray-200 dark:border-gray-200/30";

  switch (actionKey) {
    case "claimCancelled":
    case "claimCancelledSelf":
    case "reportRejected":
    case "reportDeleted":
      return {
        card: "bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800/40",
        readCard,
        icon: actionKey === "reportDeleted" ? Trash2 : XCircle,
        iconBg: "bg-red-100 dark:bg-red-900/60",
        iconColor: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
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
        card: "bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800/40",
        readCard,
        icon: CheckCircle2,
        iconBg: "bg-green-100 dark:bg-green-900/60",
        iconColor: "text-green-600 dark:text-green-400",
        dot: "bg-green-500",
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
        card: "bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-800/40",
        readCard,
        icon: actionKey === "reportCreatedLost" ? PlusCircle : actionKey === "claimMade" ? CheckCircle2 : Clock,
        iconBg: "bg-orange-100 dark:bg-orange-900/60",
        iconColor: "text-orange-600 dark:text-orange-400",
        dot: "bg-orange-500",
        labelKey: `notif.action.${actionKey}`,
      };
    case "reportEdited":
      return {
        card: "bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800/40",
        readCard,
        icon: Pencil,
        iconBg: "bg-blue-100 dark:bg-blue-900/60",
        iconColor: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500",
        labelKey: "notif.action.reportEdited",
      };
    default:
      return {
        card: "bg-brand-50 dark:bg-brand-100/60 border-brand-200 dark:border-brand-200/30",
        readCard,
        icon: actionKey === "newFoundReport" ? PackageOpen : actionKey === "reportCreatedFound" ? PlusCircle : Sparkles,
        iconBg: "bg-brand-100 dark:bg-brand-100/60",
        iconColor: "text-brand-600 dark:text-brand-600",
        dot: "bg-brand-500",
        labelKey:
          actionKey === "newFoundReport" ? "notif.action.newFoundReport"
          : actionKey === "reportCreatedFound" ? "notif.action.reportCreatedFound"
          : "notif.action.match",
      };
  }
}

function formatTime(date: Date, t: Translator, locale: Locale): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("notif.justNow");
  if (diffMins < 60) return t("notif.minsAgo", { n: diffMins });
  if (diffHours < 24) return t("notif.hoursAgo", { n: diffHours });
  if (diffDays < 7) return t("notif.daysAgo", { n: diffDays });

  return new Date(date).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    month: "short", day: "numeric",
  });
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const session = await requireSession();
  const notifications = await getMyNotifications(session.userId);
  const isAdmin = session.role === "ADMIN";
  const locale = await getLocale();
  const t = getTranslator(locale);

  const unread = notifications.filter((n) => !n.isRead);
  const allRead = notifications.filter((n) => n.isRead);
  const hasRead = allRead.length > 0;

  const page = sp.page ? parseInt(sp.page) : 1;
  const readStart = (page - 1) * READ_PAGE_SIZE;
  const read = allRead.slice(readStart, readStart + READ_PAGE_SIZE);
  const hasNextReadPage = allRead.length > readStart + READ_PAGE_SIZE;

  const getNotificationLink = (actionKey: string, reportId: string): string => {
    if (isAdmin && actionKey === "newFoundReport") return "/admin/verification";
    return `/report/${reportId}`;
  };

  const renderCard = (notification: (typeof notifications)[number], isReadCard: boolean) => {
    const matchedReport = notification.matchedReport;
    const meta = getNotifMeta(notification.actionKey);
    const Icon = meta.icon;
    const href = matchedReport ? getNotificationLink(notification.actionKey, matchedReport.id) : null;

    const reportType = matchedReport?.type;
    const typeLabel = reportType === "LOST" ? t("type.lost") : reportType === "FOUND" ? t("type.found") : null;
    const typePill = reportType === "LOST"
      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
      : "bg-brand-100 text-brand-700 dark:bg-brand-200/50 dark:text-brand-600";

    // matchedReport title when present; otherwise snapshot title (e.g. deleted report)
    const reportTitle = matchedReport?.title ?? notification.title ?? null;
    const areaName = matchedReport?.area?.name;
    const categoryName = matchedReport?.category?.name;

    const content = (
      <>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
          <Icon size={18} className={meta.iconColor} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className={`text-sm font-semibold truncate ${isReadCard ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-900"}`}>
              {t(meta.labelKey)}
            </p>
            {typeLabel && (
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${typePill}`}>
                {typeLabel}
              </span>
            )}
          </div>

          {reportTitle && (
            <p className={`text-xs truncate font-medium ${isReadCard ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-700"}`}>
              {reportTitle}
            </p>
          )}

          {(areaName || categoryName) && (
            <div className="flex items-center gap-2 mt-0.5">
              {areaName && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  <MapPin size={10} className="shrink-0" />
                  {areaName}
                </span>
              )}
              {areaName && categoryName && <span className="text-gray-300 dark:text-gray-600 text-[11px]">·</span>}
              {categoryName && (
                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate">
                  <Tag size={10} className="shrink-0" />
                  {categoryName}
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {formatTime(notification.createdAt, t, locale)}
          </p>
        </div>

        {!isReadCard && (
          <span className={`h-2 w-2 rounded-full ${meta.dot} shrink-0`} />
        )}

        {href && <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />}
      </>
    );

    const cardClasses = isReadCard ? meta.readCard : meta.card;
    const baseClass = `flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${cardClasses}`;

    // NotifCardWrapper handles click-to-mark-read + navigation
    return (
      <NotifCardWrapper
        key={notification.id}
        notifId={notification.id}
        href={href}
        isRead={isReadCard}
        className={baseClass}
      >
        {content}
      </NotifCardWrapper>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 py-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-900 min-w-0 truncate">{t("notif.title")}</h1>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <form action={async () => {
              "use server";
              await markAllNotificationsAsRead(session.userId);
              revalidatePath("/notifications");
              revalidatePath("/", "layout");
            }}>
              <button
                type="submit"
                disabled={unread.length === 0}
                className="text-sm font-semibold px-4 py-2 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-brand-700 dark:text-brand-600 bg-brand-50 dark:bg-brand-100/50 hover:bg-brand-100 dark:hover:bg-brand-100/80 border-brand-200 dark:border-brand-200/40"
              >
                {t("notif.markAllRead")}
              </button>
            </form>
            {hasRead && <ClearReadButton userId={session.userId} />}
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-200 flex items-center justify-center">
            <Bell size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-900">{t("notif.empty.title")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("notif.empty.subtitle")}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {unread.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("notif.section.new")}</h2>
              {unread.map((n) => renderCard(n, false))}
            </div>
          )}
          {read.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{t("notif.section.earlier")}</h2>
              {read.map((n) => renderCard(n, true))}
              <Pagination
                page={page} hasNext={hasNextReadPage}
                basePath="/notifications" searchParams={sp}
                prevLabel={t("common.prev")} nextLabel={t("common.next")}
                pageLabel={t("common.page", { n: page })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
