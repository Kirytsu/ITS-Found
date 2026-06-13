/**
 * src/lib/i18n/config.ts
 * Locale constants shared by server + client i18n helpers.
 */
export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "id" || value === "en";
}
