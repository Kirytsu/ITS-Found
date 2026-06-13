/**
 * src/app/(main)/page.tsx — Dashboard / Home
 * Branded ITS-navy hero + semantic action cards (orange = kehilangan, navy = penemuan).
 */
import Link from "next/link";
import { ArrowRight, Search, PackageOpen, ClipboardList, Archive } from "lucide-react";
import { getRecentReports } from "@/lib/actions/report.actions";
import ReportCard from "@/components/shared/ReportCard";
import { getLocale } from "@/lib/i18n/server";
import { getTranslator } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const [recentLost, recentFound] = await Promise.all([
    getRecentReports("LOST", 4),
    getRecentReports("FOUND", 2),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Hero — branded ITS-navy panel ── */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient text-[#ffffff] px-6 py-8 sm:py-10 shadow-lg shadow-brand-900/20 animate-fade-rise">
        <div aria-hidden className="absolute inset-0 bg-brand-grid opacity-50" />
        <div aria-hidden className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#ffffff]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ffffff]/80" /> {t("dashboard.kicker")}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.1]">
            {t("dashboard.heroTitle")}
          </h1>
          <p className="text-sm text-[#ffffff]/80 max-w-md leading-relaxed">
            {t("dashboard.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* ── Action Cards — solid color = differentiate lapor vs lihat, orange = kehilangan, navy = penemuan ── */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/report/new?type=lost" className="block animate-fade-rise" style={{ animationDelay: "60ms" }}>
          <div className="flex h-full flex-col gap-2.5 p-4 sm:p-5 rounded-2xl border-2 border-orange-600 dark:border-orange-700 bg-orange-600 hover:bg-orange-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Search size={20} className="text-[#ffffff]" strokeWidth={2} />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#ffffff] leading-snug">{t("nav.reportLost")}</p>
            </div>
            <p className="text-xs text-[#ffffff]/75 leading-relaxed">{t("dashboard.cardReportLostDesc")}</p>
          </div>
        </Link>

        <Link href="/report/new?type=found" className="block animate-fade-rise" style={{ animationDelay: "120ms" }}>
          <div className="flex h-full flex-col gap-2.5 p-4 sm:p-5 rounded-2xl border-2 border-[#001f59] bg-[#001f59] hover:bg-[#001a4a] hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <PackageOpen size={20} className="text-[#ffffff]" strokeWidth={2} />
              </div>
              <p className="text-sm sm:text-base font-bold text-[#ffffff] leading-snug">{t("nav.reportFound")}</p>
            </div>
            <p className="text-xs text-[#ffffff]/75 leading-relaxed">{t("dashboard.cardReportFoundDesc")}</p>
          </div>
        </Link>

        <Link href="/lost" className="block animate-fade-rise" style={{ animationDelay: "180ms" }}>
          <div className="flex h-full flex-col gap-2.5 p-4 sm:p-5 rounded-2xl border-2 border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                <ClipboardList size={20} className="text-orange-600 dark:text-orange-400" strokeWidth={2} />
              </div>
              <p className="text-sm sm:text-base font-bold text-orange-700 dark:text-orange-400 leading-snug">{t("page.lost.title")}</p>
            </div>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/70 leading-relaxed">{t("dashboard.cardBrowseLostDesc")}</p>
          </div>
        </Link>

        <Link href="/found" className="block animate-fade-rise" style={{ animationDelay: "240ms" }}>
          <div className="flex h-full flex-col gap-2.5 p-4 sm:p-5 rounded-2xl border-2 border-brand-200 bg-brand-50 hover:bg-brand-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                <Archive size={20} className="text-brand-600" strokeWidth={2} />
              </div>
              <p className="text-sm sm:text-base font-bold text-brand-700 leading-snug">{t("page.found.title")}</p>
            </div>
            <p className="text-xs text-brand-600/80 leading-relaxed">{t("dashboard.cardBrowseFoundDesc")}</p>
          </div>
        </Link>
      </section>

      {/* ── Recent Lost Reports ── */}
      <ReportSection
        title={t("dashboard.recentLost")}
        seeAllHref="/lost"
        seeAllLabel={t("common.seeAll")}
        moreLabel={t("common.showMore")}
        reports={recentLost}
        emptyText={t("dashboard.emptyLost")}
        locale={locale}
      />

      {/* ── Recent Found Reports ── */}
      {recentFound.length > 0 && (
        <ReportSection
          title={t("dashboard.recentFound")}
          seeAllHref="/found"
          seeAllLabel={t("common.seeAll")}
          moreLabel={t("common.showMore")}
          reports={recentFound}
          emptyText={t("dashboard.emptyFound")}
          locale={locale}
        />
      )}
    </div>
  );
}

function ReportSection({
  title, seeAllHref, seeAllLabel, moreLabel, reports, emptyText, locale,
}: {
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
  moreLabel: string;
  reports: Awaited<ReturnType<typeof getRecentReports>>;
  emptyText: string;
  locale: Locale;
}) {
  return (
    <section className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <h2 className="text-base font-bold text-gray-900 min-w-0 truncate">{title}</h2>
        <Link
          href={seeAllHref}
          className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 flex-shrink-0"
        >
          {seeAllLabel} <ArrowRight size={14} />
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{emptyText}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reports.map((r) => <ReportCard key={r.id} report={r} locale={locale} />)}
          </div>
          <Link href={seeAllHref}>
            <button className="w-full py-3 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 active:bg-brand-800 transition-colors">
              {moreLabel}
            </button>
          </Link>
        </>
      )}
    </section>
  );
}
