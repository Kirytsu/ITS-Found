/**
 * src/lib/utils.ts
 * Shared utility functions used across the application.
 */

/** Format Date to Indonesian locale string */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format Date to short form (e.g., "15 Mei 2026") */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Truncate text to specified length */
export function truncate(text: string, max = 100): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
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
