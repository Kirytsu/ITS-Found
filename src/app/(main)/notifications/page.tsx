/**
 * src/app/(main)/notifications/page.tsx
 * User notifications page - displays all notifications with matched reports.
 */
import Link from "next/link";
import Image from "next/image";
import { Bell, ArrowRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { requireSession } from "@/lib/auth";
import { getMyNotifications, markAllNotificationsAsRead } from "@/lib/actions/notification.actions";

function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return new Date(date).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
    });
}

export default async function NotificationsPage() {
    const session = await requireSession();
    const notifications = await getMyNotifications(session.userId);

    // Mark all notifications as read
    if (notifications.some(n => !n.isRead)) {
        await markAllNotificationsAsRead(session.userId);
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Notifikasi" />

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bell size={28} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-gray-900">Tidak ada notifikasi</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Anda akan menerima notifikasi ketika ada laporan yang cocok
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((notification) => {
                        const matchedReport = notification.matchedReport;

                        return (
                            <div
                                key={notification.id}
                                className={`rounded-2xl border p-4 transition-colors ${notification.isRead
                                    ? "bg-gray-50 border-gray-200"
                                    : "bg-teal-50 border-teal-200"
                                    }`}
                            >
                                <div className="flex gap-3">
                                    {/* Unread indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-teal-600 mt-1.5" />
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-600">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Action Button - Link to matched report */}
                                    {matchedReport && (
                                        <Link
                                            href={`/report/${matchedReport.id}`}
                                            className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/50 transition-colors"
                                            title="Lihat laporan"
                                        >
                                            <ArrowRight size={18} className="text-gray-600" />
                                        </Link>
                                    )}
                                </div>

                                {/* Matched Report Preview */}
                                {matchedReport && (
                                    <Link
                                        href={`/report/${matchedReport.id}`}
                                        className="mt-3 p-3 rounded-lg bg-white/70 hover:bg-white border border-gray-200/50 flex items-start gap-3 transition-colors"
                                    >
                                        <div className="flex-shrink-0">
                                            {matchedReport.imageUrl ? (
                                                <Image
                                                    src={matchedReport.imageUrl}
                                                    alt={matchedReport.title}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <Bell size={20} className="text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                {matchedReport.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {matchedReport.type === "LOST" ? "Kehilangan" : "Penemuan"} • {matchedReport.area.name}
                                            </p>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
