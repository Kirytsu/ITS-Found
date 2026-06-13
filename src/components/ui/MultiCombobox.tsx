"use client";
/**
 * src/components/ui/MultiCombobox.tsx
 * Multi-select searchable picker (value = string[]). Dropdown stays open while
 * toggling; selections render as removable chips. Used for LOST report areas.
 */
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";
import { clsx } from "clsx";
import { useT } from "@/components/shared/LanguageProvider";
import type { SelectOption } from "@/types";

interface MultiComboboxProps {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function MultiCombobox({
  label, helperText, error, options, value, onChange,
  placeholder, required, disabled,
}: MultiComboboxProps) {
  const t = useT();
  const resolvedPlaceholder = placeholder ?? t("combobox.multiPlaceholder");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.filter((o) => value.includes(o.value));
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (val: string) =>
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  const remove = (val: string) => onChange(value.filter((v) => v !== val));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-900">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          className={clsx(
            "w-full flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm text-left",
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            error ? "border-red-400" : "border-gray-200",
            isOpen && "ring-2 ring-brand-500 border-transparent"
          )}
        >
          <span className={clsx("truncate", value.length === 0 && "text-gray-400")}>
            {value.length === 0 ? resolvedPlaceholder : t("combobox.areasSelected", { n: String(value.length) })}
          </span>
          <ChevronDown size={16} className={clsx("flex-shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search size={14} className="flex-shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("combobox.searchPlaceholder")}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400">{t("combobox.noResults")}</li>
              ) : (
                filtered.map((opt) => {
                  const isSel = value.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      onClick={() => toggle(opt.value)}
                      className={clsx(
                        "flex cursor-pointer select-none items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-brand-50",
                        isSel ? "font-semibold text-brand-700" : "text-gray-700"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSel && <Check size={15} className="flex-shrink-0 text-brand-600" />}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {selected.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 py-1 pl-2.5 pr-1 text-xs font-medium text-brand-700"
            >
              <span className="max-w-[11rem] truncate">{o.label}</span>
              <button
                type="button"
                onClick={() => remove(o.value)}
                className="rounded-full p-0.5 transition-colors hover:bg-brand-100"
                aria-label={t("combobox.removeChip", { label: o.label })}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
