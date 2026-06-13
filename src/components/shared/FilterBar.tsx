"use client";
/**
 * src/components/shared/FilterBar.tsx
 *
 * Wrapped in Suspense by consumer pages (uses useSearchParams).
 * Layout: responsive grid for top row.
 */
import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Combobox from "@/components/ui/Combobox";
import Select from "@/components/ui/Select";
import SearchInput from "@/components/ui/SearchInput";
import DatePicker from "@/components/ui/DatePicker";
import { useT } from "@/components/shared/LanguageProvider";
import type { SelectOption } from "@/types";

interface FilterBarProps {
  areas: SelectOption[];
  categories: SelectOption[];
  showStatus?: boolean;
  showDateRange?: boolean;
}

export default function FilterBar({ areas, categories, showStatus = false, showDateRange = true }: FilterBarProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const t            = useT();
  const [, startTransition] = useTransition();

  const STATUS_OPTIONS: SelectOption[] = [
    { value: "PUBLISHED",  label: t("status.active") },
    { value: "UNVERIFIED", label: t("status.unverified") },
    { value: "RESOLVED",   label: t("status.resolved") },
    { value: "REJECTED",   label: t("status.rejected") },
  ];

  const [area, setArea]         = useState(searchParams.get("areaId") ?? "");
  const [category, setCategory] = useState(searchParams.get("categoryId") ?? "");
  const [status, setStatus]     = useState(searchParams.get("status") ?? "");
  const [search, setSearch]     = useState(searchParams.get("search") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo]     = useState(searchParams.get("dateTo") ?? "");

  const push = (updates: Record<string, string>) => {
    startTransition(() => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
      p.delete("page");
      router.push(`${pathname}?${p.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 bg-white rounded-xl border border-gray-200 p-4">
      {/* Row 1: Area + Category — always 2 cols */}
      <div className="grid grid-cols-2 gap-3">
        <Combobox
          options={areas} value={area}
          onChange={(v) => { setArea(v); push({ areaId: v }); }}
          placeholder={t("filter.allAreas")}
        />
        <Select
          options={categories} value={category}
          onChange={(e) => { setCategory(e.target.value); push({ categoryId: e.target.value }); }}
          placeholder={t("filter.allTypes")}
        />
      </div>

      {/* Status (My Reports only) */}
      {showStatus && (
        <Select
          options={STATUS_OPTIONS} value={status}
          onChange={(e) => { setStatus(e.target.value); push({ status: e.target.value }); }}
          placeholder={t("filter.allStatus")}
        />
      )}

      {/* Search — full width */}
      <SearchInput
        placeholder={t("filter.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => push({ search })}
        onKeyDown={(e) => e.key === "Enter" && push({ search })}
      />

      {/* Date range — 2 cols */}
      {showDateRange && (
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => {
                const v = e.target.value;
                setDateFrom(v);
                // Keep range valid: pull dateTo up if it would now be before dateFrom.
                if (dateTo && v && v > dateTo) {
                  setDateTo(v);
                  push({ dateFrom: v, dateTo: v });
                } else {
                  push({ dateFrom: v });
                }
              }}
            />
            <DatePicker
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => {
                const v = e.target.value;
                setDateTo(v);
                // Keep range valid: push dateFrom down if it would now be after dateTo.
                if (dateFrom && v && v < dateFrom) {
                  setDateFrom(v);
                  push({ dateFrom: v, dateTo: v });
                } else {
                  push({ dateTo: v });
                }
              }}
            />
          </div>
          {dateFrom && dateTo && dateFrom > dateTo && (
            <p className="text-xs text-red-500">{t("filter.dateRange.invalid")}</p>
          )}
        </div>
      )}
    </div>
  );
}
