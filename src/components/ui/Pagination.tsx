/**
 * src/components/ui/Pagination.tsx
 * Prev/Next pagination — preserves existing query params, swaps `page`.
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  hasNext: boolean;
  basePath: string;
  searchParams: object;
  prevLabel: string;
  nextLabel: string;
  pageLabel: string;
}

export default function Pagination({ page, hasNext, basePath, searchParams, prevLabel, nextLabel, pageLabel }: PaginationProps) {
  if (page <= 1 && !hasNext) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams as Record<string, string | undefined>).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const navClasses = "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors";
  const activeClasses = "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50";
  const disabledClasses = "bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed";

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={`${navClasses} ${activeClasses}`}>
          <ChevronLeft size={16} /> {prevLabel}
        </Link>
      ) : (
        <span className={`${navClasses} ${disabledClasses}`}>
          <ChevronLeft size={16} /> {prevLabel}
        </span>
      )}

      <span className="text-xs font-medium text-gray-400">{pageLabel}</span>

      {hasNext ? (
        <Link href={buildHref(page + 1)} className={`${navClasses} ${activeClasses}`}>
          {nextLabel} <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${navClasses} ${disabledClasses}`}>
          {nextLabel} <ChevronRight size={16} />
        </span>
      )}
    </div>
  );
}
