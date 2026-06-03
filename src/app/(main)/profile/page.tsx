/**
 * src/app/(main)/profile/page.tsx
 * User profile page - displays user details and statistics.
 */
import Link from "next/link";
import { Mail, Calendar, FileText, Bell } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { getUserProfile } from "@/lib/actions/user.actions";

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default async function ProfilePage() {
    const user = await getUserProfile();

    const roleLabel = user.role === "ADMIN" ? "Administrator" : "User";

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="Profil Saya" />

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                {/* Avatar + Basic Info */}
                <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 select-none">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">{roleLabel}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-4 pt-5">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Mail size={18} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Calendar size={18} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Bergabung sejak</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
                {/* Total Reports */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={18} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Total Laporan</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{user._count.reports}</p>
                        </div>
                    </div>
                </div>

                {/* Unread Notifications */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Bell size={18} className="text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">Notifikasi Belum Dibaca</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{user._count.notifications}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-col gap-3">
                <Link
                    href="/my-reports"
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm font-semibold text-gray-900">Lihat Semua Laporan</span>
                    <span className="text-gray-400">→</span>
                </Link>

                <Link
                    href="/notifications"
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm font-semibold text-gray-900">Lihat Notifikasi</span>
                    <span className="text-gray-400">→</span>
                </Link>

                <Link
                    href="/settings"
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                    <span className="text-sm font-semibold text-gray-900">Pengaturan</span>
                    <span className="text-gray-400">→</span>
                </Link>
            </div>
        </div>
    );
}
