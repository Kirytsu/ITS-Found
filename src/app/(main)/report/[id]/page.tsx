/**
 * src/app/(main)/report/[id]/page.tsx — Detail Laporan
 * Minimal page — delegates to ReportMetaCard, MatchedReportsSection, ReportDetailActions.
 */
import { notFound } from "next/navigation";
import { getReportById } from "@/lib/actions/report.actions";
import { getMatchedReports } from "@/lib/actions/notification.actions";
import { getSession } from "@/lib/auth";
import PageHeader from "@/components/ui/PageHeader";
import ReportMetaCard from "@/components/shared/ReportMetaCard";
import ReportTimeline from "@/components/shared/ReportTimeline";
import MatchedReportsSection from "@/components/shared/MatchedReportsSection";
import ReportDetailActions from "@/components/shared/ReportDetailActions";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = rawId.trim();

  if (!id) notFound();

  const [report, matches, session] = await Promise.all([
    getReportById(id),
    getMatchedReports(id),
    getSession(),
  ]);

  if (!report) notFound();

  const isOwner = session?.userId === report.authorId;
  const isAdmin = session?.role === "ADMIN";
  const locale = await getLocale();
  const t = getTranslator(locale);

  return (
    <div className="flex flex-col gap-4 pb-28">
      <PageHeader title={t("detail.pageTitle")} />
      
      {/* Claimant Banner */}
      {report.claim && session?.userId === report.claim.userId && report.status !== "RESOLVED" && (
        <div className="rounded-2xl bg-brand-50 border border-brand-200 p-4 flex flex-col gap-1.5 shadow-sm animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-brand-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {t("detail.claimBanner.title")}
          </h4>
          <p className="text-xs text-brand-700 leading-relaxed">
            {t("detail.claimBanner.body", { facility: report.facility?.name || t("detail.defaultFacility") })}
          </p>
        </div>
      )}

      <MatchedReportsSection matches={matches} sourceReport={report} />
      <ReportMetaCard report={report} locale={locale} />

      {/* Admin Claim Info Card */}
      {isAdmin && report.claim && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col p-5 gap-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            {t("detail.claimInfo.title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs text-gray-400 block">{t("detail.claimInfo.claimantName")}</span>
                <span className="text-sm font-semibold text-gray-900">{report.claim.user.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t("auth.email")}</span>
                <span className="text-sm font-medium text-gray-900">{report.claim.user.email}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t("detail.claimInfo.date")}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDateTime(report.claim.createdAt, locale)} WIB
                </span>
              </div>
              {report.claim.notes && (
                <div>
                  <span className="text-xs text-gray-400 block">{t("detail.claimInfo.notes")}</span>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 italic leading-relaxed mt-1">
                    &ldquo;{report.claim.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Image proof */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-400">{t("modal.photoProof")}</span>
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={report.claim.photoUrl} alt={t("detail.claimInfo.photoAlt")} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Offline Taker Info Card */}
      {isAdmin && report.status === "RESOLVED" && report.type === "FOUND" && !report.claim && report.takerPhone && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col p-5 gap-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            {t("detail.offlineInfo.title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs text-gray-400 block">{t("form.takerName.label")}</span>
                <span className="text-sm font-semibold text-gray-900">{report.takerName}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t("form.takerPhone.label")}</span>
                <span className="text-sm font-medium text-gray-900">{report.takerPhone}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t("form.takerIdCard.label")}</span>
                <span className="text-sm font-medium text-gray-900">{report.takerIdCard}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">{t("detail.offlineInfo.handoverDate")}</span>
                <span className="text-sm font-medium text-gray-900">
                  {report.resolvedAt && formatDateTime(report.resolvedAt, locale)} WIB
                </span>
              </div>
              {report.takerNotes && (
                <div>
                  <span className="text-xs text-gray-400 block">{t("detail.offlineInfo.notes")}</span>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 italic leading-relaxed mt-1">
                    &ldquo;{report.takerNotes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Image proof */}
            {report.takerPhotoUrl && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-400">{t("modal.photoProof")}</span>
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={report.takerPhotoUrl} alt={t("detail.offlineInfo.photoAlt")} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ReportTimeline report={report} t={t} locale={locale} />
      <ReportDetailActions
        report={{
          id: report.id,
          type: report.type,
          status: report.status,
          facility: report.facility
            ? { name: report.facility.name, phone: report.facility.phone ?? "" }
            : null,
        }}
        isOwner={isOwner}
        isAdmin={isAdmin}
        userId={session?.userId}
        userRole={session?.role}
        hasClaim={!!report.claim}
        claimUserId={report.claim?.userId}
        claimantName={report.claim?.user.name}
      />
    </div>
  );
}
