"use client";
/**
 * src/components/ui/Combobox.tsx
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { clsx } from "clsx";
import { useT } from "@/components/shared/LanguageProvider";
import type { SelectOption } from "@/types";

interface ComboboxProps {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
}

export default function Combobox({
  label, helperText, error, options, value, onChange,
  placeholder, required, disabled, name,
}: ComboboxProps) {
  const t = useT();
  const resolvedPlaceholder = placeholder ?? t("combobox.singlePlaceholder");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = useCallback((opt: SelectOption) => {
    onChange(opt.value);
    setQuery("");
    setIsOpen(false);
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

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
      {name && <input type="hidden" name={name} value={value} />}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((v) => !v)}
          className={clsx(
            "w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-sm text-left",
            "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
            "disabled:bg-gray-50 disabled:cursor-not-allowed",
            error ? "border-red-400" : "border-gray-200",
            isOpen && "ring-2 ring-brand-500 border-transparent"
          )}
        >
          <span className={clsx(!selectedLabel && "text-gray-400")}>
            {selectedLabel || resolvedPlaceholder}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            {value && (
              <X size={14} onClick={handleClear} className="hover:text-gray-600 cursor-pointer pointer-events-auto" />
            )}
            <ChevronDown size={16} className={clsx("transition-transform", isOpen && "rotate-180")} />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("combobox.searchPlaceholder")}
                className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0
                ? <li className="px-3 py-2 text-sm text-gray-400">{t("combobox.noResults")}</li>
                : filtered.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
                      className={clsx(
                        "px-3 py-2 text-sm cursor-pointer select-none hover:bg-brand-50 hover:text-brand-700",
                        opt.value === value && "bg-brand-50 font-semibold text-brand-700"
                      )}
                    >
                      {opt.label}
                    </li>
                  ))
              }
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
