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

  return (
    <div className="flex flex-col gap-4 pb-28">
      <PageHeader title="Detail Laporan" />
      <MatchedReportsSection matches={matches} />
      <ReportMetaCard report={report} />
      <ReportTimeline report={report} />
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
      />
    </div>
  );
}
