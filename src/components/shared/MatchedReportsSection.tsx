"use client";
/**
 * src/components/shared/MatchedReportsSection.tsx
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X, ArrowRight, CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ReportImage from "@/components/ui/ReportImage";
import { useT, useLocale } from "@/components/shared/LanguageProvider";
import { typeToBadgeVariant, formatDateShort } from "@/lib/utils";
import type { ReportWithRelations } from "@/types";

interface Props {
  matches: ReportWithRelations[];
  sourceReport: ReportWithRelations;
}

function MatchBanner({ count }: { count: number }) {
  const t = useT();
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowBanner(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-brand-50 border border-brand-200 px-4 py-3">
      <Sparkles size={18} className="text-brand-500 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium text-brand-800">
        {t("matched.banner", { count })}
      </p>
      <button onClick={() => setShowBanner(false)} className="text-brand-400 hover:text-brand-600">
        <X size={16} />
      </button>
    </div>
  );
}

export default function MatchedReportsSection({ matches, sourceReport }: Props) {
  const t = useT();
  const locale = useLocale();

  if (matches.length === 0) return null;

  const sourceAreaIds = new Set(
    (sourceReport.areas?.length ? sourceReport.areas : [sourceReport.area]).map((a) => a.id)
  );

  return (
    <div className="flex flex-col gap-3">
      <MatchBanner key={matches.length} count={matches.length} />
      <div className="flex items-center gap-1.5">
        <Sparkles size={15} className="text-brand-500" />
        <h3 className="text-sm font-bold text-gray-900">{t("matched.title")}</h3>
        <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
          {matches.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {matches.map((m) => {
          const matchAreas = m.areas?.length ? m.areas : [m.area];
          const sharedAreaNames = matchAreas.filter((a) => sourceAreaIds.has(a.id)).map((a) => a.name);
          const sameCategory = m.category.id === sourceReport.category.id;

          return (
            <Link
              key={m.id}
              href={`/report/${m.id}`}
              className="group flex gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 dark:bg-brand-950/20 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <ReportImage src={m.imageUrl} alt={m.title} className="h-full" emptySize={22} />
                <div className="absolute left-1 top-1">
                  <Badge variant={typeToBadgeVariant(m.type)} locale={locale} />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate text-xs font-medium text-gray-500">{m.area.name}</span>
                  <span className="flex-shrink-0 text-gray-300">&middot;</span>
                  <span className="truncate text-xs font-medium text-brand-600">{m.category.name}</span>
                  <span className="flex-shrink-0 text-gray-300">&middot;</span>
                  <span className="shrink-0 text-xs text-gray-400">{formatDateShort(m.incidentDate)}</span>
                </div>

                <h4 className="text-sm font-bold leading-snug text-gray-900 line-clamp-1 break-words">
                  {m.title}
                </h4>

                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {sameCategory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                      <CheckCircle2 size={11} />
                      {t("matched.reason.category", { category: m.category.name })}
                    </span>
                  )}
                  {sharedAreaNames.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                      <CheckCircle2 size={11} />
                      {t("matched.reason.area", { area: sharedAreaNames.join(", ") })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                    <CheckCircle2 size={11} />
                    {t("matched.reason.date")}
                  </span>
                </div>
              </div>

              <ArrowRight size={16} className="shrink-0 self-center text-brand-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
