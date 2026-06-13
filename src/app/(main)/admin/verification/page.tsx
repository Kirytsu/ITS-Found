/**
 * src/app/(main)/admin/verification/page.tsx
 * Verification queue — FOUND reports that either need verifying (UNVERIFIED, default)
 * or have already been verified (PUBLISHED). Verify/Reject live on unverified cards.
 * (Full status access + edit lives on the public /found + /lost pages for admins.)
 */
import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/shared/FilterBar";
import AdminReportList from "@/components/shared/AdminReportList";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getAllReports } from "@/lib/actions/admin.actions";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

interface SP { areaId?: string; categoryId?: string; status?: string; dateFrom?: string; dateTo?: string; search?: string; page?: string; }

const PAGE_SIZE = 20;

async function AdminList({ sp, locale }: { sp: SP; locale: Locale }) {
  const t = getTranslator(locale);
  const page = sp.page ? parseInt(sp.page) : 1;

  // Verify queue only deals with two states; anything else falls back to UNVERIFIED.
  const status = sp.status === "PUBLISHED" ? "PUBLISHED" : "UNVERIFIED";

  const reports = await getAllReports({
    type: "FOUND",
    status,
    areaId: sp.areaId,
    categoryId: sp.categoryId,
    search: sp.search,
    dateFrom: sp.dateFrom ? new Date(sp.dateFrom) : undefined,
    dateTo: sp.dateTo ? new Date(sp.dateTo) : undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex flex-col gap-4">
      <AdminReportList reports={reports} locale={locale} />
      <Pagination
        page={page}
        hasNext={reports.length === PAGE_SIZE}
        basePath="/admin/verification"
        searchParams={sp}
        prevLabel={t("common.prev")}
        nextLabel={t("common.next")}
        pageLabel={t("common.page", { n: page })}
      />
    </div>
  );
}

export default async function AdminVerificationPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const t = getTranslator(locale);
  const [areas, categories] = await Promise.all([getAllAreas(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={t("admin.verify.title")} />

      {/* Verify filter: Menunggu / Terverifikasi (default Menunggu) */}
      <Suspense fallback={<div className="h-36 rounded-xl bg-gray-100 animate-pulse" />}>
        <FilterBar
          areas={areas} categories={categories}
          showStatus statusMode="verify" showDateRange
        />
      </Suspense>

      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
        <AdminList sp={sp} locale={locale} />
      </Suspense>
    </div>
  );
}
