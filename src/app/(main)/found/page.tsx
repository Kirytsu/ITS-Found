/**
 * src/app/(main)/found/page.tsx
 */
import { Suspense } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import FilterBar from "@/components/shared/FilterBar";
import ReportCard from "@/components/shared/ReportCard";
import { getAllAreas, getAllCategories } from "@/lib/actions/area.actions";
import { getPublicReports } from "@/lib/actions/report.actions";
import type { ReportFilters, ReportStatus } from "@/types";

interface SP { areaId?: string; categoryId?: string; status?: string; dateFrom?: string; dateTo?: string; search?: string; page?: string; }

async function ReportList({ sp }: { sp: SP }) {
  const filters: ReportFilters = {
    areaId: sp.areaId, categoryId: sp.categoryId, search: sp.search,
    status: sp.status as ReportStatus | undefined,
    dateFrom: sp.dateFrom ? new Date(sp.dateFrom) : undefined,
    dateTo: sp.dateTo ? new Date(sp.dateTo) : undefined,
    page: sp.page ? parseInt(sp.page) : 1, limit: 12,
  };
  const reports = await getPublicReports("FOUND", filters);
  const nextPage = (parseInt(sp.page ?? "1")) + 1;

  if (reports.length === 0)
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <p className="text-sm text-gray-400">Tidak ada laporan penemuan ditemukan.</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reports.map((r) => <ReportCard key={r.id} report={r} />)}
      </div>
      {reports.length === 12 && (
        <Link href={`/found?${new URLSearchParams({ ...sp, page: String(nextPage) })}`}>
          <button className="w-full py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
            Tampilkan lebih
          </button>
        </Link>
      )}
    </div>
  );
}

export default async function FoundPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [areas, categories] = await Promise.all([getAllAreas(), getAllCategories()]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="Laporan Penemuan" />
        <Link href="/report/new?type=found">
          <button className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
            <PlusCircle size={16} /> Lapor
          </button>
        </Link>
      </div>
      <Suspense fallback={<div className="h-36 rounded-xl bg-gray-100 animate-pulse" />}>
        <FilterBar areas={areas} categories={categories} showStatus showDateRange />
      </Suspense>
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)}</div>}>
        <ReportList sp={sp} />
      </Suspense>
    </div>
  );
}
