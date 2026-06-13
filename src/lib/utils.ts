/**
 * src/lib/utils.ts
 * Shared utility functions used across the application.
 */

type DateLocale = "id" | "en";
const intlLocale = (l: DateLocale) => (l === "en" ? "en-US" : "id-ID");

/** Format Date to a long locale string (e.g., "15 Mei 2026" / "May 15, 2026") */
export function formatDate(date: Date | string, locale: DateLocale = "id"): string {
  return new Date(date).toLocaleDateString(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format Date to short form (e.g., "15 Mei 2026" / "May 15, 2026") */
export function formatDateShort(date: Date | string, locale: DateLocale = "id"): string {
  return new Date(date).toLocaleDateString(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format Date with time (e.g., "15 Mei 2026, 14.30" / "May 15, 2026, 2:30 PM") */
export function formatDateTime(date: Date | string, locale: DateLocale = "id"): string {
  return new Date(date).toLocaleDateString(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Truncate text to specified length */
export function truncate(text: string, max = 100): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

/** True if the value parses to a real calendar date */
export function isValidDate(date: Date | string): boolean {
  return !isNaN(new Date(date).getTime());
}

/** True if the (valid) date falls after the end of today — i.e. a future date */
export function isFutureDate(date: Date | string): boolean {
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return d.getTime() > endOfToday.getTime();
}

/** Today's date as a local `YYYY-MM-DD` string (for <input type="date" max=…>) */
export function todayInputValue(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** Map ReportStatus to Badge variant */
export function statusToBadgeVariant(
  status: string
): "active" | "unverified" | "resolved" | "rejected" {
  switch (status) {
    case "PUBLISHED":  return "active";
    case "UNVERIFIED": return "unverified";
    case "RESOLVED":   return "resolved";
    case "REJECTED":   return "rejected";
    default:           return "active";
  }
}

/** Map ReportType to Badge variant */
export function typeToBadgeVariant(type: string): "lost" | "found" {
  return type === "LOST" ? "lost" : "found";
}
