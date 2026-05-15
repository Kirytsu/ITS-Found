/**
 * src/app/(main)/page.tsx — Dashboard / Home
 * Monochrome design — icons same color (gray-600), no orange/teal on cards.
 */
import Link from "next/link";
import { ArrowRight, Search, PackageOpen } from "lucide-react";
import { getRecentReports } from "@/lib/actions/report.actions";
import ReportCard from "@/components/shared/ReportCard";

export default async function HomePage() {
  const [recentLost, recentFound] = await Promise.all([
    getRecentReports("LOST", 4),
    getRecentReports("FOUND", 2),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero ── */}
      <section className="text-center pt-4 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
          Menemukan atau<br className="sm:hidden" /> Kehilangan Barang?
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Laporkan dan temukan barang hilang di lingkungan kampus ITS.
        </p>
      </section>

      {/* ── Action Cards — monochrome style ── */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/report/new?type=lost" className="block">
          <div className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Search size={22} className="text-gray-600" strokeWidth={2} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-800 text-center leading-snug">
              Lapor Kehilangan
            </span>
          </div>
        </Link>

        <Link href="/report/new?type=found" className="block">
          <div className="flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <PackageOpen size={22} className="text-gray-600" strokeWidth={2} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-800 text-center leading-snug">
              Lapor Penemuan
            </span>
          </div>
        </Link>
      </section>

      {/* ── Recent Lost Reports ── */}
      <ReportSection
        title="Laporan kehilangan terbaru"
        seeAllHref="/lost"
        reports={recentLost}
        emptyText="Belum ada laporan kehilangan."
      />

      {/* ── Recent Found Reports ── */}
      {recentFound.length > 0 && (
        <ReportSection
          title="Laporan penemuan terbaru"
          seeAllHref="/found"
          reports={recentFound}
          emptyText="Belum ada laporan penemuan."
        />
      )}
    </div>
  );
}

function ReportSection({
  title, seeAllHref, reports, emptyText,
}: {
  title: string;
  seeAllHref: string;
  reports: Awaited<ReturnType<typeof getRecentReports>>;
  emptyText: string;
}) {
  return (
    <section className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <h2 className="text-base font-bold text-gray-900 min-w-0 truncate">{title}</h2>
        <Link
          href={seeAllHref}
          className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 flex-shrink-0"
        >
          Lihat semua <ArrowRight size={14} />
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{emptyText}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
          <Link href={seeAllHref}>
            <button className="w-full py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 active:bg-black transition-colors">
              Tampilkan lebih
            </button>
          </Link>
        </>
      )}
    </section>
  );
}
