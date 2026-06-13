/**
 * src/components/shared/ReportMetaCard.tsx
 * Detail card for report — image + metadata rows + title.
 * Extracted from report/[id]/page.tsx for reusability.
 */
import ReportImage from "@/components/ui/ReportImage";
import Badge from "@/components/ui/Badge";
import { formatDate, statusToBadgeVariant } from "@/lib/utils";
import { translate } from "@/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { ReportWithRelations } from "@/types";

interface MetaRow {
  label: string;
  value: React.ReactNode;
}

interface ReportMetaCardProps {
  report: ReportWithRelations;
  locale?: Locale;
}

export default function ReportMetaCard({ report, locale = DEFAULT_LOCALE }: ReportMetaCardProps) {
  const t = (key: string) => translate(locale, key);

  const rows: MetaRow[] = [
    { label: t("meta.status"),       value: <Badge variant={statusToBadgeVariant(report.status)} locale={locale} /> },
    {
      label: t("meta.caseType"),
      value: (
        <span className={report.type === "LOST" ? "text-orange-600 font-semibold" : "text-brand-600 font-semibold"}>
          {report.type === "LOST" ? t("type.lost") : t("type.found")}
        </span>
      ),
    },
    { label: t("meta.itemType"),     value: report.category.name },
    { label: t("meta.incidentDate"), value: formatDate(report.incidentDate, locale) },
    { label: t("meta.locationDetail"), value: report.locationDetail },
    { label: t("meta.description"),  value: report.description },
    {
      label: report.areas && report.areas.length > 1 ? t("meta.areaMulti") : t("meta.area"),
      value: report.areas && report.areas.length > 0
        ? report.areas.map((a) => a.name).join(", ")
        : report.area.name,
    },
    ...(report.type === "FOUND" && report.facility
      ? [
          { label: t("meta.facility"),        value: report.facility.name },
          { label: t("meta.facilityAddress"), value: report.facility.address || "-" },
          { label: t("meta.facilityPhone"),   value: report.facility.phone || "-" },
        ]
      : []),
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Image — full photo, never cropped, bigger frame for detail view */}
      <ReportImage src={report.imageUrl} alt={report.title} className="h-80 sm:h-96" emptySize={48} />

      {/* Title */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900 leading-snug break-words">{report.title}</h1>
      </div>

      {/* Meta rows */}
      <div className="px-5 pb-5 flex flex-col divide-y divide-gray-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-3 py-2.5">
            <span className="text-sm text-gray-500 w-40 flex-shrink-0">{label}</span>
            <span className="text-sm text-gray-900 font-medium flex-1 min-w-0 break-words whitespace-pre-wrap">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
