"use server";
/**
 * src/lib/actions/claim.actions.ts
 * Server Actions for Claiming FOUND reports.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireSession } from "../auth";
import { getT } from "../i18n/server";
import { createClaimNotification, createClaimCancelledNotification, notifyAdminsClaimMade } from "./notification.actions";
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

    // 4. Create Claim record
    const claim = await db.claim.create({
      data: {
        reportId,
        userId: session.userId,
        photoUrl,
        notes: notes?.trim() || null,
      },
    });

    // 4.5 Send notifications
    // Notify report author about the claim
    await createClaimNotification(reportId);
    // Notify admins to mark this report as resolved after verification
    await notifyAdminsClaimMade(reportId);

    // 5. Revalidate relevant paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");

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

    // 4. Delete Claim
    await db.claim.delete({
      where: { id: claim.id },
    });

    // 4.5 Send notification to report author
    await createClaimCancelledNotification(reportId);

    // 5. Revalidate paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");

    return {
      success: true,
      message: t("action.claim.cancelSuccess"),
    };
  } catch (error) {
    console.error("[Cancel Claim Error]", error);
    return { success: false, message: t("action.claim.cancelError") };
  }
}
