"use server";
/**
 * src/lib/actions/admin.actions.ts
 * Admin-only Server Actions: report verification and status management.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireAdmin } from "../auth";
import { getT } from "../i18n/server";
import { findMatches, createMatchNotifications, notifyReporterVerified, notifyClaimerReportResolved } from "./notification.actions";
import type { ActionResult, ReportWithRelations } from "../../types";

const REPORT_INCLUDE = {
  author: { select: { id: true, name: true, email: true } },
  category: true,
  area: true,
  facility: true,
  verifiedBy: { select: { name: true } },
  resolvedBy: { select: { name: true } },
  claim: {
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  },
} as const;

/** Returns all FOUND reports waiting for admin verification. */
export async function getUnverifiedFoundReports(): Promise<ReportWithRelations[]> {
  await requireAdmin();
  const reports = await db.report.findMany({
    where: { type: "FOUND", status: "UNVERIFIED" },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: "asc" }, // oldest first
  });
  return reports as unknown as ReportWithRelations[];
}

/** Returns ALL reports for admin overview, with optional filters. */
export async function getAllReports(filters?: {
  status?: string;
  type?: string;
}): Promise<ReportWithRelations[]> {
  await requireAdmin();
  const reports = await db.report.findMany({
    where: {
      ...(filters?.status && { status: filters.status as never }),
      ...(filters?.type && { type: filters.type as never }),
    },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return reports as unknown as ReportWithRelations[];
}

/**
 * Verify a FOUND report: UNVERIFIED → PUBLISHED.
 * Triggers Smart Match after publishing.
 */
export async function verifyReport(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const t = await getT();

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return { success: false, message: t("action.report.notFound") };
  if (report.status !== "UNVERIFIED") {
    return { success: false, message: t("action.admin.notPendingVerification") };
  }

  await db.report.update({
    where: { id },
    data: { 
      status: "PUBLISHED",
      verifiedAt: new Date(),
      verifiedBy: { connect: { id: session.userId } },
    },
  });

  // Notify report author that their FOUND report was verified
  await notifyReporterVerified(id);

  // Run Smart Match now that the FOUND report is published
  const matches = await findMatches(id);
  await createMatchNotifications(id, matches);

  // Revalidate all relevant paths
  revalidatePath("/admin/verification");
  revalidatePath("/found");
  revalidatePath("/");
  revalidatePath(`/report/${id}`);

  return { success: true, message: t("action.admin.verifySuccess") };
}

/** Reject a FOUND report: UNVERIFIED → REJECTED. */
export async function rejectReport(id: string): Promise<ActionResult> {
  await requireAdmin();
  const t = await getT();

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return { success: false, message: t("action.report.notFound") };
  if (report.status !== "UNVERIFIED") {
    return { success: false, message: t("action.admin.notPendingVerification") };
  }

  await db.report.update({ where: { id }, data: { status: "REJECTED" } });

  // Revalidate all relevant paths
  revalidatePath("/admin/verification");
  revalidatePath(`/report/${id}`);
  revalidatePath("/");

  return { success: true, message: t("action.admin.rejectSuccess") };
}

/**
 * Admin override: force-update any report's status.
 * Used for setting RESOLVED or any other admin correction.
 */
export async function forceUpdateStatus(
  id: string,
  newStatus: "PUBLISHED" | "UNVERIFIED" | "RESOLVED" | "REJECTED"
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getT();

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return { success: false, message: t("action.report.notFound") };

  await db.report.update({ where: { id }, data: { status: newStatus } });

  // Revalidate all relevant paths
  revalidatePath(`/report/${id}`);
  revalidatePath("/admin/verification");
  revalidatePath("/lost");
  revalidatePath("/found");
  revalidatePath("/");

  return { success: true, message: t("action.admin.statusUpdateSuccess", { status: newStatus }) };
}
