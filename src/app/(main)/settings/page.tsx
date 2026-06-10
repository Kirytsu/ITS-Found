"use client";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTheme } from "@/components/shared/ThemeProvider";

type Theme = "light" | "dark";
type Language = "id" | "en";

function ToggleGroup<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { console.log("button clicked:", opt.value); onChange(opt.value); }}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === opt.value
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<Language>("id");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengaturan" />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-900">Tema</h2>
        <ToggleGroup<Theme>
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: <><Sun size={18} /> Mode Terang</> },
            { value: "dark",  label: <><Moon size={18} /> Mode Gelap</> },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-900">Bahasa</h2>
        <ToggleGroup<Language>
          value={language}
          onChange={setLanguage}
          options={[
            { value: "id", label: <>🇮🇩 Indonesia</> },
            { value: "en", label: <>🇬🇧 English</> },
          ]}
        />
        <p className="text-xs text-gray-400">* Pengaturan bahasa akan diimplementasikan pada versi berikutnya.</p>
      </section>

      <section className="flex flex-col gap-2 mt-2">
        <h2 className="text-base font-bold text-gray-900">Tentang Aplikasi</h2>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 flex flex-col gap-0.5">
          <p className="text-sm font-bold text-gray-800">ITS Found</p>
          <p className="text-xs text-gray-500">Sistem Penemuan Barang Hilang ITS</p>
          <p className="text-xs text-gray-400 mt-1">Versi 1.0.0</p>
        </div>
      </section>
    </div>
  );
}