/**
 * src/lib/i18n/server.ts
 * Server-side locale access (reads the `locale` cookie) + a bound translator.
 */
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { getTranslator, type Translator } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<Translator> {
  return getTranslator(await getLocale());
}
