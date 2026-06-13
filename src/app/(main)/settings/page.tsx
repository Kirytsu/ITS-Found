"use client";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useTheme } from "@/components/shared/ThemeProvider";
import { useLanguage, useT } from "@/components/shared/LanguageProvider";
import type { Locale } from "@/lib/i18n/config";

type Theme = "light" | "dark";

function ToggleGroup<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
            value === opt.value
              ? "border-brand-500 bg-brand-50 text-brand-700"
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
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const t = useT();

  const changeLanguage = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    router.refresh(); // re-render server components in the new language
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("settings.title")} />

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-900">{t("settings.theme")}</h2>
        <ToggleGroup<Theme>
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: <><Sun size={18} /> {t("settings.theme.light")}</> },
            { value: "dark",  label: <><Moon size={18} /> {t("settings.theme.dark")}</> },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-900">{t("settings.language")}</h2>
        <ToggleGroup<Locale>
          value={locale}
          onChange={changeLanguage}
          options={[
            { value: "id", label: <>Bahasa</> },
            { value: "en", label: <>English</> },
          ]}
        />
      </section>

      <section className="flex flex-col gap-2 mt-2">
        <h2 className="text-base font-bold text-gray-900">{t("settings.about")}</h2>
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 flex flex-col gap-0.5">
          <p className="text-sm font-bold text-gray-800">{t("settings.about.name")}</p>
          <p className="text-xs text-gray-500">{t("settings.about.desc")}</p>
          <p className="text-xs text-gray-400 mt-1">{t("settings.about.version")}</p>
        </div>
      </section>
    </div>
  );
}
