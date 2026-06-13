"use server";
/**
 * src/lib/actions/claim.actions.ts
 * Server Actions for Claiming FOUND reports.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireSession } from "../auth";
import { getT } from "../i18n/server";
import {
  createClaimNotification, createClaimCancelledNotification,
  notifyClaimantClaimed, notifyClaimantCancelled, notifyClaimRejected,
} from "./notification.actions";
import type { ActionResult } from "../../types";

/**
 * Creates a claim for a FOUND report.
 */
export async function createClaim(
  reportId: string,
  photoUrl: string,
  notes?: string
): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();

  // 1. Validate inputs
  if (!reportId) {
    return { success: false, message: t("action.claim.invalidReportId") };
  }
  if (!photoUrl) {
    return { success: false, message: t("action.claim.photoRequired") };
  }

  // 2. Validate roles
  if (session.role === "ADMIN") {
    return { success: false, message: t("action.claim.adminNotAllowed") };
  }

  try {
    // 3. Find and check report eligibility
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { claim: true },
    });

    if (!report) {
      return { success: false, message: t("action.claim.notFound") };
    }

    if (report.type !== "FOUND") {
      return { success: false, message: t("action.claim.notFoundType") };
    }

    if (report.status !== "PUBLISHED") {
      return { success: false, message: t("action.claim.notClaimable") };
    }

    if (report.authorId === session.userId) {
      return { success: false, message: t("action.claim.ownReport") };
    }

    if (report.claim) {
      return { success: false, message: t("action.claim.alreadyClaimed") };
    }

    // 4. Create Claim record + move report into the real CLAIM_PENDING status
    const claim = await db.claim.create({
      data: {
        reportId,
        userId: session.userId,
        photoUrl,
        notes: notes?.trim() || null,
      },
    });
    await db.report.update({ where: { id: reportId }, data: { status: "CLAIM_PENDING" } });

    // 4.5 Send notifications
    // Notify report author about the claim
    await createClaimNotification(reportId);
    // (Admins no longer get a per-claim notif — pending claims live in the verification page's
    //  "Klaim Menunggu" queue instead, avoiding duplicate "claim awaiting resolution" spam.)
    // Self-notification: claimant has a record of their claim
    await notifyClaimantClaimed(session.userId, reportId);

    // 5. Revalidate relevant paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");
    revalidatePath("/", "layout"); // refresh admin sidebar verify badge

    return {
      success: true,
      message: t("action.claim.createSuccess"),
      data: { claimId: claim.id },
    };
  } catch (error) {
    // Handle database unique constraint (race condition)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return {
        success: false,
        message: t("action.claim.raceCondition"),
      };
    }
    console.error("[Create Claim Error]", error);
    return { success: false, message: t("action.claim.createError") };
  }
}

/**
 * Cancels a claim for a FOUND report.
 */
export async function cancelClaim(reportId: string): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();

  if (!reportId) {
    return { success: false, message: t("action.claim.invalidReportId") };
  }

  try {
    // 1. Fetch report and claim
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { claim: true },
    });

    if (!report) {
      return { success: false, message: t("action.claim.notFound") };
    }

    const claim = report.claim;
    if (!claim) {
      return { success: false, message: t("action.claim.notFoundForCancel") };
    }

    // 2. Validate authorization
    if (claim.userId !== session.userId) {
      return { success: false, message: t("action.claim.noCancelAccess") };
    }

    // 3. Validate report status
    if (report.status === "RESOLVED") {
      return { success: false, message: t("action.claim.cannotCancelResolved") };
    }

    // 4. Delete Claim + return report to claimable PUBLISHED status
    await db.claim.delete({
      where: { id: claim.id },
    });
    if (report.status === "CLAIM_PENDING") {
      await db.report.update({ where: { id: reportId }, data: { status: "PUBLISHED" } });
    }

    // 4.5 Send notification to report author + self-record for the claimant
    await createClaimCancelledNotification(reportId);
    await notifyClaimantCancelled(session.userId, reportId);

    // 5. Revalidate paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");
    revalidatePath("/", "layout"); // refresh admin sidebar verify badge

    return {
      success: true,
      message: t("action.claim.cancelSuccess"),
    };
  } catch (error) {
    console.error("[Cancel Claim Error]", error);
    return { success: false, message: t("action.claim.cancelError") };
  }
}

/**
 * Admin rejects a pending claim. The claim is removed and the report stays PUBLISHED,
 * so it becomes claimable again (any user, including the rejected one, may re-claim).
 */
export async function rejectClaim(reportId: string): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();

  if (session.role !== "ADMIN") {
    return { success: false, message: t("action.claim.adminOnlyReject") };
  }

  try {
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { claim: true },
    });

    if (!report) return { success: false, message: t("action.claim.notFound") };
    const claim = report.claim;
    if (!claim) return { success: false, message: t("action.claim.notFoundForCancel") };
    if (report.status === "RESOLVED") {
      return { success: false, message: t("action.claim.cannotCancelResolved") };
    }

    // Remove the claim — report returns to its claimable PUBLISHED state.
    await db.claim.delete({ where: { id: claim.id } });
    if (report.status === "CLAIM_PENDING") {
      await db.report.update({ where: { id: reportId }, data: { status: "PUBLISHED" } });
    }

    // Notify the claimant their claim was rejected
    await notifyClaimRejected(claim.userId, reportId);

    revalidatePath(`/report/${reportId}`);
    revalidatePath("/admin/verification");
    revalidatePath("/found");
    revalidatePath("/");
    revalidatePath("/", "layout"); // refresh admin sidebar verify badge

    return { success: true, message: t("action.claim.rejectSuccess") };
  } catch (error) {
    console.error("[Reject Claim Error]", error);
    return { success: false, message: t("action.claim.cancelError") };
  }
}
