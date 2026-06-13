"use client";
/**
 * src/components/shared/AdminReportList.tsx
 * Admin report grid: UNVERIFIED reports get Verify/Reject actions (VerificationCard),
 * everything else renders as a normal ReportCard. Mutations re-fetch via router.refresh.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import VerificationCard from "@/components/shared/VerificationCard";
import ReportCard from "@/components/shared/ReportCard";
import { verifyReport, rejectReport } from "@/lib/actions/admin.actions";
import { useT } from "@/components/shared/LanguageProvider";
import type { ReportWithRelations } from "@/types";
import type { Locale } from "@/lib/i18n/config";

export default function AdminReportList({
  reports, locale,
}: { reports: ReportWithRelations[]; locale: Locale }) {
  const router = useRouter();
  const t = useT();
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

  if (reports.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">{t("admin.verify.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {feedback && (
        <div className="rounded-lg bg-brand-50 dark:bg-brand-100/50 border border-brand-200 dark:border-brand-200/40 px-4 py-3 text-sm text-brand-800 dark:text-brand-600">
          {feedback}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) =>
          r.status === "UNVERIFIED" ? (
            <VerificationCard
              key={r.id}
              report={r}
              onVerify={handleVerify}
              onReject={handleReject}
              isPending={isPending}
            />
          ) : (
            <ReportCard key={r.id} report={r} locale={locale} />
          )
        )}
      </div>
    </div>
  );
}
