"use client";
/**
 * src/app/(main)/admin/verification/page.tsx
 * Admin verification queue — now uses VerificationCard component.
 */
import { useState, useEffect, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import VerificationCard from "@/components/shared/VerificationCard";
import { getUnverifiedFoundReports, verifyReport, rejectReport } from "@/lib/actions/admin.actions";
import { useT } from "@/components/shared/LanguageProvider";
import type { ReportWithRelations } from "@/types";

export default function AdminVerificationPage() {
  const t = useT();
  const [reports, setReports] = useState<ReportWithRelations[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    getUnverifiedFoundReports().then((data) => {
      setReports(data);
      setLoaded(true);
    });
  }, []);

  const handleVerify = (id: string) => {
    startTransition(async () => {
      const result = await verifyReport(id);
      setFeedback(result.message);
      setReports((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const handleReject = (id: string) => {
    if (!confirm(t("admin.verify.confirmReject"))) return;
    startTransition(async () => {
      const result = await rejectReport(id);
      setFeedback(result.message);
      setReports((prev) => prev.filter((r) => r.id !== id));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("admin.verify.title")} />

      {feedback && (
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-800">
          {feedback}
        </div>
      )}

      {!loaded ? (
        <p className="py-8 text-center text-sm text-gray-400">{t("common.loading")}</p>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <ShieldCheck size={48} className="text-brand-300" />
          <p className="text-sm text-gray-400">{t("admin.verify.empty")}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 font-medium">
            {t("admin.verify.pendingCount", { n: String(reports.length) })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.map((r) => (
              <VerificationCard
                key={r.id}
                report={r}
                onVerify={handleVerify}
                onReject={handleReject}
                isPending={isPending}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
