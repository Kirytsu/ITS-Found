"use client";
/**
 * src/components/shared/MatchedReportsSection.tsx
 */
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import ReportCard from "@/components/shared/ReportCard";
import type { ReportWithRelations } from "@/types";

interface Props { matches: ReportWithRelations[]; }

function MatchBanner({ count }: { count: number }) {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowBanner(false), 6000);
    return () => clearTimeout(timeout);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-teal-50 border border-teal-200 px-4 py-3">
      <Sparkles size={18} className="text-teal-500 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium text-teal-800">
        Ditemukan {count} laporan yang mungkin cocok!
      </p>
      <button onClick={() => setShowBanner(false)} className="text-teal-400 hover:text-teal-600">
        <X size={16} />
      </button>
    </div>
  );
}

export default function MatchedReportsSection({ matches }: Props) {

  if (matches.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <MatchBanner key={matches.length} count={matches.length} />
      <div className="flex items-center gap-1.5">
        <Sparkles size={15} className="text-teal-500" />
        <h3 className="text-sm font-bold text-gray-900">Laporan yang Mungkin Cocok</h3>
        <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
          {matches.length}
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth-x">
        {matches.map((m) => (
          <div key={m.id} className="flex-shrink-0 w-64">
            <ReportCard report={m} showTypeBadge />
          </div>
        ))}
      </div>
    </div>
  );
}
