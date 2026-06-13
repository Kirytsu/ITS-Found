import type { ReportWithRelations } from "@/types";

function formatTimelineDate(date: Date) {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).replace(".", ":");
  return `${dateStr}, ${timeStr} WIB`;
}

export default function ReportTimeline({ report }: { report: ReportWithRelations }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 shadow-sm">
      <h3 className="font-bold text-gray-900">Riwayat Laporan</h3>
      <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-gray-100">
        
        {/* Dibuat */}
        <div className="relative pl-8">
          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            Dibuat oleh <span className="font-bold">{report.author.name}</span>
          </p>
          <p className="text-xs text-gray-500">{formatTimelineDate(report.createdAt)}</p>
        </div>

        {/* Diverifikasi (if FOUND and verified) */}
        {report.type === "FOUND" && report.verifiedAt && report.verifiedBy && (
          <div className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Diverifikasi oleh <span className="font-bold">{report.verifiedBy.name}</span> (Admin)
            </p>
            <p className="text-xs text-gray-500">{formatTimelineDate(report.verifiedAt)}</p>
          </div>
        )}

        {/* Diklaim (if FOUND and has claim) */}
        {report.type === "FOUND" && report.claim && (
          <div className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              Diklaim oleh <span className="font-bold">{report.claim.user.name}</span>
            </p>
            <p className="text-xs text-gray-500">{formatTimelineDate(report.claim.createdAt)}</p>
          </div>
        )}

        {/* Diselesaikan / Diambil */}
        {report.status === "RESOLVED" && report.resolvedAt && report.resolvedBy && (
          <div className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-brand-50 border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
            </div>
            {report.type === "FOUND" ? (
              <p className="text-sm font-medium text-gray-900">
                Diambil oleh <span className="font-bold">{report.takerName}</span> <br/>
                <span className="text-xs text-gray-500">Diselesaikan oleh {report.resolvedBy.name}</span>
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-900">
                Diselesaikan oleh <span className="font-bold">{report.resolvedBy.name}</span>
              </p>
            )}
            <p className="text-xs text-gray-500">{formatTimelineDate(report.resolvedAt)}</p>
          </div>
        )}

      </div>
    </div>
  );
}
