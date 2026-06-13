"use server";
/**
 * src/lib/actions/notification.actions.ts
 * Smart Match notification logic and notification management.
 */
import { db } from "../db";
import { revalidatePath } from "next/cache";
import type { ReportWithRelations } from "../../types";

/**
 * Finds matching reports of the opposite type within the same:
 *   - area
 *   - category
 *   - date (same calendar day, ±1 day tolerance)
 *
 * Called after a LOST report is created or a FOUND report is verified.
 */
export async function findMatches(
  reportId: string
): Promise<ReportWithRelations[]> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { area: true, areas: true, category: true, author: true, facility: true },
  });
  if (!report) return [];

  const oppositeType = report.type === "LOST" ? "FOUND" : "LOST";
  // A report may span multiple areas (LOST) — match on any overlap.
  const sourceAreaIds = report.areas.length > 0 ? report.areas.map((a) => a.id) : [report.areaId];

  // Build date window: same day ±1 day
  const incidentDay = new Date(report.incidentDate);
  const from = new Date(incidentDay);
  from.setDate(from.getDate() - 1);
  from.setHours(0, 0, 0, 0);
  const to = new Date(incidentDay);
  to.setDate(to.getDate() + 1);
  to.setHours(23, 59, 59, 999);

  const matches = await db.report.findMany({
    where: {
      type: oppositeType,
      status: "PUBLISHED",
      areas: { some: { id: { in: sourceAreaIds } } },
      categoryId: report.categoryId,
      incidentDate: { gte: from, lte: to },
      id: { not: reportId },
    },
    include: {
      author: true,
      category: true,
      area: true,
      areas: true,
      facility: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return matches as unknown as ReportWithRelations[];
}

/**
 * Creates match notifications for all relevant users.
 * - Notifies the author of `sourceReportId` about each match (only if different authors).
 * - Notifies the author of each matched report about the source (only if different authors).
 */
export async function createMatchNotifications(
  sourceReportId: string,
  matches: ReportWithRelations[]
): Promise<void> {
  if (matches.length === 0) return;

  const source = await db.report.findUnique({
    where: { id: sourceReportId },
    include: { category: true, area: true },
  });
  if (!source) return;

  const typeLabel = source.type === "LOST" ? "kehilangan" : "penemuan";
  const oppositeLabel = source.type === "LOST" ? "penemuan" : "kehilangan";

  // Create notifications in parallel
  await Promise.all(
    matches.map(async (match) => {
      // Only notify if authors are different (don't notify user about their own reports)
      if (match.authorId !== source.authorId) {
        // Notify the source report's author
        await db.notification.create({
          data: {
            userId: source.authorId,
            message: `Ada laporan ${oppositeLabel} yang cocok dengan laporan ${typeLabel} Anda: "${match.title}" di ${source.area.name}.`,
            matchedReportId: match.id,
          },
        });
        // Notify the matched report's author
        await db.notification.create({
          data: {
            userId: match.authorId,
            message: `Ada laporan ${typeLabel} yang cocok dengan laporan ${oppositeLabel} Anda: "${source.title}" di ${source.area.name}.`,
            matchedReportId: sourceReportId,
          },
        });
      }
    })
  );
}

/**
 * Notifies the report author when a user claims their FOUND report.
 */
export async function createClaimNotification(
  reportId: string,
  claimerId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { category: true, area: true },
  });
  if (!report) return;

  const claimer = await db.user.findUnique({
    where: { id: claimerId },
  });
  if (!claimer) return;

  // Notify the report author that their item was claimed
  await db.notification.create({
    data: {
      userId: report.authorId,
      message: `${claimer.name} mengajukan klaim untuk laporan "${report.title}" Anda. Silakan verifikasi di fasilitas penitipan ${report.area.name}.`,
      matchedReportId: reportId,
    },
  });
}

/**
 * Notifies the report author when a claim is cancelled.
 */
export async function createClaimCancelledNotification(
  reportId: string,
  claimerName: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { area: true },
  });
  if (!report) return;

  // Notify the report author that the claim was cancelled
  await db.notification.create({
    data: {
      userId: report.authorId,
      message: `${claimerName} telah membatalkan klaim untuk laporan "${report.title}" Anda. Laporan kembali tersedia untuk diklaim.`,
      matchedReportId: reportId,
    },
  });
}

/**
 * Notifies all admins when a FOUND report is created.
 * Admin needs to verify the report before it becomes visible.
 */
export async function notifyAdminsNewFoundReport(
  reportId: string,
  reporterName: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { area: true, category: true },
  });
  if (!report) return;

  // Find all admins
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
  });

  if (admins.length === 0) return;

  // Create notification for each admin
  await Promise.all(
    admins.map((admin) =>
      db.notification.create({
        data: {
          userId: admin.id,
          message: `Laporan penemuan baru dari ${reporterName}: "${report.title}" di ${report.area.name}. Silakan verifikasi laporan ini.`,
          matchedReportId: reportId,
        },
      })
    )
  );
}

/**
 * Notifies all admins when a claim is made on a FOUND report.
 * Admin needs to mark it as "selesai" after claimant verifies at facility.
 */
export async function notifyAdminsClaimMade(
  reportId: string,
  claimerName: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { area: true, facility: true },
  });
  if (!report) return;

  // Find all admins
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
  });

  if (admins.length === 0) return;

  // Create notification for each admin
  await Promise.all(
    admins.map((admin) =>
      db.notification.create({
        data: {
          userId: admin.id,
          message: `${claimerName} mengajukan klaim untuk "${report.title}". Setelah verifikasi fisik di ${report.facility?.name || "fasilitas penitipan"}, silakan tandai laporan ini sebagai selesai.`,
          matchedReportId: reportId,
        },
      })
    )
  );
}

/**
 * Notifies the claimer when admin marks a FOUND report as resolved.
 */
export async function notifyClaimerReportResolved(
  reportId: string,
  claimerName: string,
  claimerEmail: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { claim: true },
  });
  if (!report || !report.claim) return;

  // Notify the claimer that the report is resolved
  await db.notification.create({
    data: {
      userId: report.claim.userId,
      message: `Barang Anda "${report.title}" sudah tersedia untuk diambil. Silakan datang ke fasilitas penitipan untuk mengambilnya.`,
      matchedReportId: reportId,
    },
  });
}

/**
 * Notifies the report author when admin verifies their FOUND report.
 */
export async function notifyReporterVerified(
  reportId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
    include: { area: true },
  });
  if (!report) return;

  // Notify the report author that their FOUND report was verified
  await db.notification.create({
    data: {
      userId: report.authorId,
      message: `Laporan penemuan "${report.title}" Anda telah diverifikasi dan dipublikasikan. Orang yang mencari barang ini dapat melihatnya sekarang.`,
      matchedReportId: reportId,
    },
  });
}

/** Returns matched reports to display in MatchedReportsSection on the detail page. */
export async function getMatchedReports(
  reportId: string
): Promise<ReportWithRelations[]> {
  return findMatches(reportId);
}

/** Marks a notification as read. */
export async function markNotificationAsRead(notifId: string): Promise<void> {
  await db.notification.update({
    where: { id: notifId },
    data: { isRead: true },
  });
}

/** Marks all notifications for a user as read. */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/** Returns all notifications for a user, newest first. */
export async function getMyNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      matchedReport: {
        include: { area: true, areas: true, category: true, author: true, facility: true },
      },
    },
  });
}
