"use client";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { LanguageProvider } from "@/components/shared/LanguageProvider";
import type { Locale } from "@/lib/i18n/config";

export default function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <LanguageProvider locale={locale}>
      <ThemeProvider>{children}</ThemeProvider>
    </LanguageProvider>
  );
}
