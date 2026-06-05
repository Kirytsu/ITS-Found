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
    include: { area: true, category: true, author: true, facility: true },
  });
  if (!report) return [];

  const oppositeType = report.type === "LOST" ? "FOUND" : "LOST";

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
      areaId: report.areaId,
      categoryId: report.categoryId,
      incidentDate: { gte: from, lte: to },
      id: { not: reportId },
    },
    include: {
      author: true,
      category: true,
      area: true,
      facility: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return matches as unknown as ReportWithRelations[];
}

/**
 * Creates match notifications for all relevant users.
 * - Notifies the author of `sourceReportId` about each match.
 * - Notifies the author of each matched report about the source.
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
    })
  );
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
  revalidatePath("/notifications");
}

/** Marks all notifications for a user as read. */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}

/** Returns all notifications for a user, newest first. */
export async function getMyNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      matchedReport: {
        include: { area: true, category: true, author: true, facility: true },
      },
    },
  });
}
