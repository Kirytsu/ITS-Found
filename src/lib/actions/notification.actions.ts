"use server";
/**
 * src/lib/actions/notification.actions.ts
 * Smart Match notification logic and notification management.
 */
import { db } from "../db";
import { revalidatePath } from "next/cache";
import { getSession } from "../auth";
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
  // Matches only surface once the source report itself is PUBLISHED.
  // A FOUND report must be admin-verified first; an UNVERIFIED/REJECTED report shows no matches.
  if (report.status !== "PUBLISHED") return [];

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

  // Create one notification per user→report pair, skipping pairs that already exist
  // (edit re-runs matching, so the same match must not notify twice).
  const ensureMatchNotif = async (userId: string, matchedReportId: string) => {
    const existing = await db.notification.findFirst({
      where: { userId, actionKey: "match", matchedReportId },
    });
    if (existing) return;
    await db.notification.create({ data: { userId, actionKey: "match", matchedReportId } });
  };

  await Promise.all(
    matches.map(async (match) => {
      // Only notify if authors are different (don't notify user about their own reports)
      if (match.authorId !== source.authorId) {
        await ensureMatchNotif(source.authorId, match.id);       // notify source author
        await ensureMatchNotif(match.authorId, sourceReportId);  // notify matched author
      }
    })
  );
}

/**
 * Notifies the report author when a user claims their FOUND report.
 */
export async function createClaimNotification(
  reportId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
  });
  if (!report) return;

  // Notify the report author that their item was claimed
  await db.notification.create({
    data: {
      userId: report.authorId,
      actionKey: "claimSubmitted",
      matchedReportId: reportId,
    },
  });
}

/**
 * Notifies the report author when a claim is cancelled.
 */
export async function createClaimCancelledNotification(
  reportId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
  });
  if (!report) return;

  // Notify the report author that the claim was cancelled
  await db.notification.create({
    data: {
      userId: report.authorId,
      actionKey: "claimCancelled",
      matchedReportId: reportId,
    },
  });
}

/**
 * Notifies all admins when a FOUND report is created.
 * Admin needs to verify the report before it becomes visible.
 */
export async function notifyAdminsNewFoundReport(
  reportId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
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
          actionKey: "newFoundReport",
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
  reportId: string
): Promise<void> {
  const report = await db.report.findUnique({
    where: { id: reportId },
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
          actionKey: "claimToResolve",
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
  reportId: string
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
      actionKey: "readyPickup",
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
  });
  if (!report) return;

  // Notify the report author that their FOUND report was verified
  await db.notification.create({
    data: {
      userId: report.authorId,
      actionKey: "verified",
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

/** Deletes only already-read notifications for a user. */
export async function clearReadNotifications(userId: string): Promise<void> {
  await db.notification.deleteMany({ where: { userId, isRead: true } });
  revalidatePath("/", "layout");
}

/** Self-notification: user created a report. */
export async function notifyUserReportCreated(
  userId: string,
  reportId: string,
  type: "LOST" | "FOUND"
): Promise<void> {
  await db.notification.create({
    data: {
      userId,
      actionKey: type === "LOST" ? "reportCreatedLost" : "reportCreatedFound",
      matchedReportId: reportId,
    },
  });
}

/** Self-notification: user edited their report. */
export async function notifyUserReportEdited(
  userId: string,
  reportId: string
): Promise<void> {
  await db.notification.create({
    data: { userId, actionKey: "reportEdited", matchedReportId: reportId },
  });
}

/** Self-notification: user deleted their report (no reportId — already deleted).
 *  Title is snapshotted so the card can still name the gone report. */
export async function notifyUserReportDeleted(userId: string, title: string): Promise<void> {
  await db.notification.create({
    data: { userId, actionKey: "reportDeleted", matchedReportId: null, title },
  });
}

/** Notifies the report author when admin rejects their FOUND report. */
export async function notifyReporterRejected(reportId: string): Promise<void> {
  const report = await db.report.findUnique({ where: { id: reportId } });
  if (!report) return;
  await db.notification.create({
    data: { userId: report.authorId, actionKey: "reportRejected", matchedReportId: reportId },
  });
}

/** Self-notification: claimant submitted a claim on a FOUND report. */
export async function notifyClaimantClaimed(userId: string, reportId: string): Promise<void> {
  await db.notification.create({
    data: { userId, actionKey: "claimMade", matchedReportId: reportId },
  });
}

/** Self-notification: claimant cancelled their own claim. */
export async function notifyClaimantCancelled(userId: string, reportId: string): Promise<void> {
  await db.notification.create({
    data: { userId, actionKey: "claimCancelledSelf", matchedReportId: reportId },
  });
}

/** Self-notification: whoever resolved a report (admin or LOST owner) marked it done. */
export async function notifyResolverDone(userId: string, reportId: string): Promise<void> {
  await db.notification.create({
    data: { userId, actionKey: "reportResolvedSelf", matchedReportId: reportId },
  });
}

/** Marks a single notification as read and updates the layout badge. */
export async function markNotificationAsRead(notifId: string): Promise<void> {
  await db.notification.update({
    where: { id: notifId },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
}

/** Returns the most recent notification for the current session user. */
export async function getLatestUserNotification() {
  const session = await getSession();
  if (!session) return null;
  return db.notification.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      matchedReport: { include: { area: true, category: true } },
    },
  });
}

/** Marks all notifications for a user as read. */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/", "layout");
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
