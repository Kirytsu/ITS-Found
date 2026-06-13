/**
 * src/components/shared/ReportCard.tsx
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ReportImage from "@/components/ui/ReportImage";
import { statusToBadgeVariant, typeToBadgeVariant, formatDateShort } from "@/lib/utils";
import { translate } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { ReportWithRelations } from "@/types";

interface ReportCardProps {
  report: ReportWithRelations;
  showTypeBadge?: boolean;
  locale?: Locale;
}

export default function ReportCard({ report, showTypeBadge = false, locale = DEFAULT_LOCALE }: ReportCardProps) {
  const extraAreas = report.areas?.length ? report.areas.length - 1 : 0;
  const areaLabel = extraAreas > 0 ? `${report.area.name} +${extraAreas}` : report.area.name;

  return (
    <Link href={`/report/${report.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
        {/* Image + badge overlay */}
        <div className="relative overflow-hidden">
          <ReportImage
            src={report.imageUrl}
            alt={report.title}
            className="h-44 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
            {showTypeBadge && <Badge variant={typeToBadgeVariant(report.type)} locale={locale} />}
            <Badge variant={statusToBadgeVariant(report.status)} locale={locale} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-xs font-medium text-gray-500">{areaLabel}</span>
            <span className="flex-shrink-0 text-gray-300">&middot;</span>
            <span className="truncate text-xs font-medium text-brand-600">{report.category.name}</span>
          </div>

          <h3 className="min-h-[2.75rem] text-base font-bold leading-snug text-gray-900 line-clamp-2 break-words">
            {report.title}
          </h3>

          <p className="text-xs text-gray-400">{formatDateShort(report.incidentDate)}</p>

          <p className="text-sm leading-relaxed text-gray-500 line-clamp-2 break-words">
            {report.description}
          </p>

          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-brand-600 transition-colors group-hover:text-brand-700">
            {translate(locale, "common.detail")}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
