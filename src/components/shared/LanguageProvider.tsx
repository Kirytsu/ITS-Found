"use client";
/**
 * src/components/shared/LanguageProvider.tsx
 * Client locale context. Seeded from the server (cookie) via the root layout.
 * setLocale writes the cookie so server components re-render translated on refresh.
 */
import { createContext, useContext, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { getTranslator, type Translator } from "@/lib/i18n/dictionaries";

interface LanguageContextValue {
  locale: Locale;
  t: Translator;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  t: getTranslator(DEFAULT_LOCALE),
  setLocale: () => {},
});

export function LanguageProvider({ locale: initial, children }: { locale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider value={{ locale, t: getTranslator(locale), setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;
export const useLocale = () => useContext(LanguageContext).locale;
