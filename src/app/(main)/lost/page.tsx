/**
 * src/app/(main)/lost/page.tsx
 */
import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/shared/FilterBar";
import ReportCard from "@/components/shared/ReportCard";
import NotifCardToast from "@/components/shared/NotifCardToast";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getPublicReports } from "@/lib/actions/report.actions";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import type { ReportFilters, ReportStatus } from "@/types";

interface SP { areaId?: string; categoryId?: string; status?: string; dateFrom?: string; dateTo?: string; search?: string; page?: string; }

const PAGE_SIZE = 20;

async function ReportList({ sp, locale }: { sp: SP; locale: Locale }) {
  const t = getTranslator(locale);
  const page = sp.page ? parseInt(sp.page) : 1;
  const filters: ReportFilters = {
    areaId: sp.areaId, categoryId: sp.categoryId, search: sp.search,
    status: sp.status as ReportStatus | undefined,
    dateFrom: sp.dateFrom ? new Date(sp.dateFrom) : undefined,
    dateTo: sp.dateTo ? new Date(sp.dateTo) : undefined,
    page, limit: PAGE_SIZE,
  };
  const reports = await getPublicReports("LOST", filters);

  if (reports.length === 0)
    return <EmptyState text={t("list.empty")} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => <ReportCard key={r.id} report={r} locale={locale} />)}
      </div>
      <Pagination
        page={page}
        hasNext={reports.length === PAGE_SIZE}
        basePath="/lost"
        searchParams={sp}
        prevLabel={t("common.prev")}
        nextLabel={t("common.next")}
        pageLabel={t("common.page", { n: page })}
      />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <p className="text-sm text-gray-400 text-center">{text}</p>
    </div>
  );
}

export default async function LostPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = getTranslator(locale);
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  const [areas, categories] = await Promise.all([getAllAreas(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={null}><NotifCardToast /></Suspense>
      <div className="flex items-center justify-between gap-4">
        <PageHeader title={t("page.lost.title")} />
        <Link href="/report/new?type=lost">
          <button className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2">
            <PlusCircle size={16} /> {t("common.report")}
          </button>
        </Link>
      </div>
      {/* Admin: full status access (all 4). Public: Aktif / Selesai only (default Aktif). */}
      <Suspense fallback={<div className="h-36 rounded-xl bg-gray-100 animate-pulse" />}>
        <FilterBar
          areas={areas} categories={categories}
          showStatus statusMode={isAdmin ? "full" : "public"} showDateRange
        />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
        <ReportList sp={sp} locale={locale} />
      </Suspense>
    </div>
  );
}
