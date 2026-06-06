/**
 * src/components/shared/ReportCard.tsx
 */
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { statusToBadgeVariant, typeToBadgeVariant, formatDateShort } from "@/lib/utils";
import type { ReportWithRelations } from "@/types";

interface ReportCardProps {
  report: ReportWithRelations;
  showTypeBadge?: boolean;
}

export default function ReportCard({ report, showTypeBadge = false }: ReportCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full h-44 bg-gray-100 flex items-center justify-center">
        {report.imageUrl ? (
          <Image src={report.imageUrl} alt={report.title} fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-300">
            <ImageIcon size={40} />
            <span className="text-xs">Tidak ada foto</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-2">
        {/* Area + badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 truncate">{report.area.name}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {showTypeBadge && <Badge variant={typeToBadgeVariant(report.type)} />}
            {report.status === "PUBLISHED" && report.claim ? (
              <Badge variant="claimed" />
            ) : (
              <Badge variant={statusToBadgeVariant(report.status)} />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1">
          {report.title}
        </h3>

        {/* Meta */}
        <p className="text-xs text-gray-400">{formatDateShort(report.incidentDate)}</p>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {report.description}
        </p>

        {/* Detail button */}
        <Link href={`/report/${report.id}`} className="block mt-1">
          <Button variant="outline" size="full" className="rounded-lg">
            Lihat Detail
          </Button>
        </Link>
      </div>
    </div>
  );
}
