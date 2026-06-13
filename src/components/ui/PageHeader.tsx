"use client";
/**
 * src/components/ui/PageHeader.tsx
 *
 * Responsive: min-w-0 + truncate on title prevents overflow.
 * Back button only shown if router history exists (uses router.back()).
 */
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/components/shared/LanguageProvider";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  const router = useRouter();
  const t = useT();

  return (
    <div className="flex items-center gap-2 py-2">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label={t("common.back")}
      >
        <ChevronLeft size={22} />
      </button>
      {/* min-w-0 + truncate prevents title from overflowing flex container */}
      <h1 className="text-xl font-bold text-gray-900 min-w-0 truncate">{title}</h1>
    </div>
  );
}
