/**
 * src/components/shared/ReportMetaCard.tsx
 * Detail card for report — image + metadata rows + title.
 * Extracted from report/[id]/page.tsx for reusability.
 */
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, statusToBadgeVariant } from "@/lib/utils";
import type { ReportWithRelations } from "@/types";

interface MetaRow {
  label: string;
  value: React.ReactNode;
}

interface ReportMetaCardProps {
  report: ReportWithRelations;
}

export default function ReportMetaCard({ report }: ReportMetaCardProps) {
  const badgeVariant = statusToBadgeVariant(report.status);

  const rows: MetaRow[] = [
    { label: "Status",           value: <Badge variant={badgeVariant} /> },
    {
      label: "Jenis Kasus",
      value: (
        <span className={report.type === "LOST" ? "text-orange-600 font-semibold" : "text-teal-600 font-semibold"}>
          {report.type === "LOST" ? "Kehilangan" : "Penemuan"}
        </span>
      ),
    },
    { label: "Jenis Barang",     value: report.category.name },
    { label: "Tanggal Kejadian", value: formatDate(report.incidentDate) },
    { label: "Lokasi Detail",    value: report.locationDetail },
    { label: "Deskripsi",        value: report.description },
    { label: "Area",             value: report.area.name },
    ...(report.type === "FOUND" && report.facility
      ? [
          { label: "Fasilitas Penitipan", value: report.facility.name },
          { label: "Alamat Fasilitas",    value: report.facility.address || "-" },
          { label: "Telepon Fasilitas",   value: report.facility.phone || "-" },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Image */}
      <div className="relative w-full h-56 bg-gray-100 flex items-center justify-center">
        {report.imageUrl ? (
          <Image src={report.imageUrl} alt={report.title} fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <ImageIcon size={48} />
            <span className="text-xs">Tidak ada foto</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 leading-snug">{report.title}</h1>
      </div>

      {/* Meta rows */}
      <div className="px-5 pb-5 flex flex-col divide-y divide-gray-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3 py-2.5">
            <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
            <span className="text-sm text-gray-900 font-medium flex-1">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
