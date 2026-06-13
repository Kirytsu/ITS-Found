/**
 * src/app/(main)/notifications/page.tsx
 * User notifications page - compact action+report cards, full messages hidden.
 */
import Link from "next/link";
import { Bell, ArrowRight, CheckCircle2, Clock, XCircle, Sparkles, type LucideIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import RefreshOnMount from "@/components/shared/RefreshOnMount";
import { requireSession } from "@/lib/auth";
import { getMyNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator, type Translator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const READ_PAGE_SIZE = 20;

interface NotifMeta {
    card: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    dot: string;
    labelKey: string;
}

/** Maps a notification's stored action key to a compact summary + consistent light/dark color set. */
function getNotifMeta(actionKey: string): NotifMeta {
    switch (actionKey) {
        case "claimCancelled":
            return {
                card: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60",
                icon: XCircle, iconBg: "bg-red-100 dark:bg-red-900/40", iconColor: "text-red-600 dark:text-red-400",
                dot: "bg-red-500", labelKey: "notif.action.claimCancelled",
            };
        case "readyPickup":
            return {
                card: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/60",
                icon: CheckCircle2, iconBg: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600 dark:text-green-400",
                dot: "bg-green-500", labelKey: "notif.action.readyPickup",
            };
        case "verified":
            return {
                card: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/60",
                icon: CheckCircle2, iconBg: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600 dark:text-green-400",
                dot: "bg-green-500", labelKey: "notif.action.verified",
            };
        case "claimSubmitted":
            return {
                card: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60",
                icon: Clock, iconBg: "bg-orange-100 dark:bg-orange-900/40", iconColor: "text-orange-600 dark:text-orange-400",
                dot: "bg-orange-500", labelKey: "notif.action.claimSubmitted",
            };
        case "claimToResolve":
            return {
                card: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60",
                icon: Clock, iconBg: "bg-orange-100 dark:bg-orange-900/40", iconColor: "text-orange-600 dark:text-orange-400",
                dot: "bg-orange-500", labelKey: "notif.action.claimToResolve",
            };
        case "newFoundReport":
            return {
                card: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/60",
                icon: Clock, iconBg: "bg-orange-100 dark:bg-orange-900/40", iconColor: "text-orange-600 dark:text-orange-400",
                dot: "bg-orange-500", labelKey: "notif.action.newFoundReport",
            };
        default:
            return {
                card: "bg-brand-50 border-brand-200",
                icon: Sparkles, iconBg: "bg-brand-100", iconColor: "text-brand-600",
                dot: "bg-brand-500", labelKey: "notif.action.match",
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
        month: "short",
        day: "numeric",
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

    const page = sp.page ? parseInt(sp.page) : 1;
    const readStart = (page - 1) * READ_PAGE_SIZE;
    const read = allRead.slice(readStart, readStart + READ_PAGE_SIZE);
    const hasNextReadPage = allRead.length > readStart + READ_PAGE_SIZE;

    const hadUnread = unread.length > 0;
    // Mark all notifications as read (after capturing pre-visit isRead state above)
    if (hadUnread) {
        await markAllNotificationsAsRead(session.userId);
    }

    // Determine navigation link based on notification type and user role
    const getNotificationLink = (actionKey: string, reportId: string): string => {
        // Admin notifications about new FOUND reports → verification page
        if (isAdmin && actionKey === "newFoundReport") {
            return "/admin/verification";
        }
        // All other notifications (including claims) → report detail page
        return `/report/${reportId}`;
    };

    const renderCard = (notification: (typeof notifications)[number], isReadCard: boolean) => {
        const matchedReport = notification.matchedReport;
        const meta = getNotifMeta(notification.actionKey);
        const Icon = meta.icon;
        const href = matchedReport ? getNotificationLink(notification.actionKey, matchedReport.id) : null;

        const content = (
            <>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isReadCard ? "bg-gray-100 dark:bg-gray-800" : meta.iconBg}`}>
                    <Icon size={18} className={isReadCard ? "text-gray-400" : meta.iconColor} strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isReadCard ? "text-gray-500 dark:text-gray-400" : "text-gray-900"}`}>{t(meta.labelKey)}</p>
                    {matchedReport && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{matchedReport.title}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">
                        {formatTime(notification.createdAt, t, locale)}
                    </p>
                </div>

                {!isReadCard && (
                    <span className={`h-2 w-2 rounded-full ${meta.dot} shrink-0`} />
                )}

                {href && <ArrowRight size={16} className="text-gray-400 shrink-0" />}
            </>
        );

        const cardClasses = isReadCard
            ? "bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800"
            : meta.card;
        const className = `flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${cardClasses} ${href ? "hover:shadow-sm" : ""}`;

        return href ? (
            <Link key={notification.id} href={href} className={className}>
                {content}
            </Link>
        ) : (
            <div key={notification.id} className={className}>
                {content}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">
            {hadUnread && <RefreshOnMount />}
            <PageHeader title={t("notif.title")} />

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bell size={28} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-900">{t("notif.empty.title")}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t("notif.empty.subtitle")}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {unread.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {t("notif.section.new")}
                            </h2>
                            {unread.map((notification) => renderCard(notification, false))}
                        </div>
                    )}

                    {read.length > 0 && (
                        <div className="flex flex-col gap-2.5">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                {t("notif.section.earlier")}
                            </h2>
                            {read.map((notification) => renderCard(notification, true))}
                            <Pagination
                                page={page}
                                hasNext={hasNextReadPage}
                                basePath="/notifications"
                                searchParams={sp}
                                prevLabel={t("common.prev")}
                                nextLabel={t("common.next")}
                                pageLabel={t("common.page", { n: page })}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
