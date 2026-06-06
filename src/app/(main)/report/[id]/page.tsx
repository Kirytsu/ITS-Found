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
      
      {/* Claimant Banner */}
      {report.claim && session?.userId === report.claim.userId && report.status !== "RESOLVED" && (
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 flex flex-col gap-1.5 shadow-sm animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-teal-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Klaim Anda Telah Diajukan
          </h4>
          <p className="text-xs text-teal-700 leading-relaxed">
            Anda telah mengajukan klaim untuk barang ini. Silakan kunjungi fasilitas penitipan terkait (<strong>{report.facility?.name || "Fasilitas Penitipan"}</strong>) untuk melakukan verifikasi kepemilikan fisik dan mengambil barang tersebut.
          </p>
        </div>
      )}

      <MatchedReportsSection matches={matches} />
      <ReportMetaCard report={report} />

      {/* Admin Claim Info Card */}
      {isAdmin && report.claim && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col p-5 gap-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Informasi Klaim Barang
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs text-gray-400 block">Nama Pengklaim</span>
                <span className="text-sm font-semibold text-gray-900">{report.claim.user.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Email</span>
                <span className="text-sm font-medium text-gray-900">{report.claim.user.email}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Tanggal Klaim</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(report.claim.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })} WIB
                </span>
              </div>
              {report.claim.notes && (
                <div>
                  <span className="text-xs text-gray-400 block">Catatan Tambahan</span>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 italic leading-relaxed mt-1">
                    "{report.claim.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Image proof */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-400">Foto Bukti</span>
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={report.claim.photoUrl} alt="Bukti Klaim" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}

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
        userId={session?.userId}
        userRole={session?.role}
        hasClaim={!!report.claim}
        claimUserId={report.claim?.userId}
        claimantName={report.claim?.user.name}
      />
    </div>
  );
}
