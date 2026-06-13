/**
 * src/app/(main)/my-reports/page.tsx
 */
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar from "@/components/shared/FilterBar";
import ReportCard from "@/components/shared/ReportCard";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getMyReports } from "@/lib/actions/report.actions";
import { getSession } from "@/lib/auth";
import DeleteSuccessToast from "@/components/shared/DeleteSuccessToast";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { ReportFilters, ReportStatus } from "@/types";

interface SP { areaId?: string; categoryId?: string; status?: string; search?: string; page?: string; }

async function MyReportList({ sp, locale }: { sp: SP; locale: Locale }) {
  const t = getTranslator(locale);
  const filters: ReportFilters = {
    areaId: sp.areaId, categoryId: sp.categoryId, search: sp.search,
    status: sp.status as ReportStatus | undefined,
    page: sp.page ? parseInt(sp.page) : 1, limit: 12,
  };
  const reports = await getMyReports(filters);
  const nextPage = (parseInt(sp.page ?? "1")) + 1;

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <p className="text-sm text-gray-400 text-center">{t("myReports.empty")}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/report/new?type=lost">
            <button className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
              + {t("nav.reportLost")}
            </button>
          </Link>
          <Link href="/report/new?type=found">
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
              + {t("nav.reportFound")}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => <ReportCard key={r.id} report={r} showTypeBadge locale={locale} />)}
      </div>
      {reports.length === 12 && (
        <Link href={`/my-reports?${new URLSearchParams({ ...sp, page: String(nextPage) })}`}>
          <button className="w-full py-3 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
            {t("common.showMore")}
          </button>
        </Link>
      )}
    </div>
  );
}

export default async function MyReportsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await getSession();
  if (!session) redirect("/login?from=/my-reports");

  const sp = await searchParams;
  const locale = await getLocale();
  const t = getTranslator(locale);
  const [areas, categories] = await Promise.all([getAllAreas(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <DeleteSuccessToast />
      </Suspense>

      <div className="flex items-center justify-between gap-4">
        <PageHeader title={t("page.myReports.title")} />
      </div>

      <Suspense fallback={<div className="h-44 rounded-xl bg-gray-100 animate-pulse" />}>
        <FilterBar areas={areas} categories={categories} showStatus showDateRange={false} />
      </Suspense>

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
        <MyReportList sp={sp} locale={locale} />
      </Suspense>
    </div>
  );
}
