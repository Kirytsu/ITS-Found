"use client";
/**
 * src/components/shared/VerificationTabs.tsx
 * Two-queue admin verification view, switched by a segmented radio control:
 *   1. "Perlu Verifikasi" — new FOUND reports awaiting verify/reject.
 *   2. "Klaim Menunggu"   — published FOUND reports with a pending user claim to resolve.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Hourglass } from "lucide-react";
import VerificationCard from "@/components/shared/VerificationCard";
import ReportCard from "@/components/shared/ReportCard";
import { clsx } from "clsx";
import { verifyReport, rejectReport } from "@/lib/actions/admin.actions";
import { useT, useLocale } from "@/components/shared/LanguageProvider";
import type { ReportWithRelations } from "@/types";

type Tab = "verify" | "claims";

export default function VerificationTabs({
  unverified, claimPending,
}: {
  unverified: ReportWithRelations[];
  claimPending: ReportWithRelations[];
}) {
  const router = useRouter();
  const t = useT();
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("verify");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");

  const handleVerify = (id: string) => {
    startTransition(async () => {
      const result = await verifyReport(id);
      setFeedback(result.message);
      router.refresh();
    });
  };

  const handleReject = (id: string) => {
    if (!confirm(t("admin.verify.confirmReject"))) return;
    startTransition(async () => {
      const result = await rejectReport(id);
      setFeedback(result.message);
      router.refresh();
    });
  };

  const tabBtn = (value: Tab, label: string, count: number, Icon: typeof ClipboardCheck) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={clsx(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
        tab === value
          ? "bg-brand-600 text-white shadow-sm"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200"
      )}
    >
      <Icon size={16} />
      {label}
      <span className={clsx(
        "min-w-5 rounded-full px-1.5 text-xs font-bold",
        tab === value ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700"
      )}>
        {count}
      </span>
    </button>
  );

  const active = tab === "verify" ? unverified : claimPending;

  return (
    <div className="flex flex-col gap-4">
      {/* Segmented radio filter */}
      <div className="flex gap-2 rounded-2xl border border-gray-200 dark:border-gray-200/40 bg-white dark:bg-gray-100 p-1.5">
        {tabBtn("verify", t("admin.tab.needVerify"), unverified.length, ClipboardCheck)}
        {tabBtn("claims", t("admin.tab.claimPending"), claimPending.length, Hourglass)}
      </div>

      {feedback && (
        <div className="rounded-lg bg-brand-50 dark:bg-brand-100/50 border border-brand-200 dark:border-brand-200/40 px-4 py-3 text-sm text-brand-800 dark:text-brand-600">
          {feedback}
        </div>
      )}

      {active.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
          {tab === "verify" ? t("admin.verify.empty") : t("admin.claims.empty")}
        </p>
      ) : tab === "verify" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {unverified.map((r) => (
            <VerificationCard
              key={r.id} report={r}
              onVerify={handleVerify} onReject={handleReject} isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {claimPending.map((r) => <ReportCard key={r.id} report={r} locale={locale} />)}
        </div>
      )}
    </div>
  );
}
