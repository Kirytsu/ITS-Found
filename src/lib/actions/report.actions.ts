"use server";
/**
 * src/lib/actions/report.actions.ts
 * CRUD Server Actions for Reports.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireSession, getSession } from "../auth";
import { isValidDate, isFutureDate } from "../utils";
import { getT } from "../i18n/server";
import {
  findMatches, createMatchNotifications, notifyAdminsNewFoundReport, notifyClaimerReportResolved,
  notifyUserReportCreated, notifyUserReportEdited, notifyUserReportDeleted, notifyResolverDone,
} from "./notification.actions";
import type {
  ActionResult,
  CreateReportInput,
  UpdateReportInput,
  ReportFilters,
  ReportWithRelations,
} from "../../types";

const REPORT_INCLUDE = {
  author: { select: { id: true, name: true, email: true } },
  category: true,
  area: true,
  areas: true,
  facility: true,
  verifiedBy: { select: { name: true } },
  resolvedBy: { select: { name: true } },
  claim: {
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  },
} as const;

// ── Create ────────────────────────────────────────────────────────────────────
export async function createReport(
  input: CreateReportInput
): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();

  // Validation
  if (!input.title.trim()) return { success: false, message: t("action.report.titleRequired") };
  if (!input.categoryId) return { success: false, message: t("action.report.categoryRequired") };
  if (!input.areaId || !input.areaIds || input.areaIds.length === 0) {
    return { success: false, message: t("action.report.areaRequired"), errors: { areaId: t("action.report.areaRequired") } };
  }
  if (!input.description.trim()) return { success: false, message: t("action.report.descriptionRequired") };
  if (!input.locationDetail.trim()) return { success: false, message: t("action.report.locationRequired") };
  if (!isValidDate(input.incidentDate)) {
    return { success: false, message: t("action.report.invalidDate"), errors: { incidentDate: t("action.report.invalidDate") } };
  }
  if (isFutureDate(input.incidentDate)) {
    return { success: false, message: t("action.report.futureDate"), errors: { incidentDate: t("action.report.futureDate") } };
  }
  if (input.type === "FOUND" && !input.facilityId) {
    return { success: false, message: t("action.report.facilityRequired") };
  }

  // LOST → PUBLISHED immediately; FOUND → UNVERIFIED (needs admin verification)
  const status = input.type === "LOST" ? "PUBLISHED" : "UNVERIFIED";

  const uniqueAreaIds = Array.from(new Set([input.areaId, ...input.areaIds]));

  const report = await db.report.create({
    data: {
      title: input.title.trim(),
      type: input.type,
      status,
      categoryId: input.categoryId,
      areaId: input.areaId,
      areas: { connect: uniqueAreaIds.map((id) => ({ id })) },
      facilityId: input.facilityId ?? null,
      locationDetail: input.locationDetail.trim(),
      description: input.description.trim(),
      incidentDate: input.incidentDate,
      imageUrl: input.imageUrl ?? null,
      authorId: session.userId,
    },
  });

  // Self-notification + admin notification
  await notifyUserReportCreated(session.userId, report.id, input.type);
  if (input.type === "FOUND") {
    await notifyAdminsNewFoundReport(report.id);
  }

  // Smart Match: only run for PUBLISHED reports
  if (status === "PUBLISHED") {
    const matches = await findMatches(report.id);
    await createMatchNotifications(report.id, matches);
  }

  revalidatePath("/");
  revalidatePath(input.type === "LOST" ? "/lost" : "/found");

  return {
    success: true,
    message: t("action.report.createSuccess"),
    data: { reportId: report.id },
  };
}

// ── Read: Public List ─────────────────────────────────────────────────────────
// Public callers ONLY ever see PUBLISHED reports — a status filter from the URL is
// ignored for them (prevents leaking UNVERIFIED / REJECTED items of other users).
// Admins may pass any status filter (or none → all statuses) to inspect the full list.
export async function getPublicReports(
  type: "LOST" | "FOUND",
  filters: ReportFilters = {}
): Promise<ReportWithRelations[]> {
  const {
    areaId,
    categoryId,
    dateFrom,
    dateTo,
    search,
    page = 1,
    limit = 10,
  } = filters;

  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  // Admin has elevated access: honor any status filter, or show ALL statuses when none.
  // Regular users only ever see PUBLISHED ("Aktif") or RESOLVED ("Selesai"); anything
  // else (UNVERIFIED / REJECTED) is clamped to PUBLISHED so it never leaks.
  const statusClause = isAdmin
    ? (filters.status ? { status: filters.status } : {})
    : { status: filters.status === "RESOLVED" ? "RESOLVED" : "PUBLISHED" };

  const where: Record<string, unknown> = {
    type,
    ...statusClause,
    ...(areaId && { areas: { some: { id: areaId } } }),
    ...(categoryId && { categoryId }),
    ...(dateFrom || dateTo
      ? { incidentDate: { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: dateTo }) } }
      : {}),
    ...(search?.trim()
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { locationDetail: { contains: search } },
          ],
        }
      : {}),
  };

  const reports = await db.report.findMany({
    where,
    include: REPORT_INCLUDE,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return reports as unknown as ReportWithRelations[];
}

// ── Read: Recent (Dashboard) ──────────────────────────────────────────────────
export async function getRecentReports(
  type: "LOST" | "FOUND",
  limit = 5
): Promise<ReportWithRelations[]> {
  const reports = await db.report.findMany({
    where: { type, status: "PUBLISHED" },
    include: REPORT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return reports as unknown as ReportWithRelations[];
}

// ── Read: My Reports ──────────────────────────────────────────────────────────
export async function getMyReports(
  filters: ReportFilters = {}
): Promise<ReportWithRelations[]> {
  const session = await requireSession();
  const { areaId, categoryId, status, search, page = 1, limit = 10 } = filters;

  const where: Record<string, unknown> = {
    authorId: session.userId,
    ...(areaId && { areas: { some: { id: areaId } } }),
    ...(categoryId && { categoryId }),
    ...(status && { status }),
    ...(search?.trim()
      ? {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { locationDetail: { contains: search } },
          ],
        }
      : {}),
  };

  const reports = await db.report.findMany({
    where,
    include: REPORT_INCLUDE,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return reports as unknown as ReportWithRelations[];
}

// ── Read: Single ──────────────────────────────────────────────────────────────
export async function getReportById(
  id: string
): Promise<ReportWithRelations | null> {
  const report = await db.report.findUnique({
    where: { id },
    include: REPORT_INCLUDE,
  });
  return report as ReportWithRelations | null;
}

// ── Update ────────────────────────────────────────────────────────────────────
export async function updateReport(
  id: string,
  input: UpdateReportInput
): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();
  const report = await db.report.findUnique({ where: { id } });

  if (!report) return { success: false, message: t("action.report.notFound") };
  if (report.authorId !== session.userId && session.role !== "ADMIN") {
    return { success: false, message: t("action.report.noEditAccess") };
  }
  if (report.status === "RESOLVED") {
    return { success: false, message: t("action.report.resolvedNoEdit") };
  }
  if (input.incidentDate !== undefined) {
    if (!isValidDate(input.incidentDate)) {
      return { success: false, message: t("action.report.invalidDate"), errors: { incidentDate: t("action.report.invalidDate") } };
    }
    if (isFutureDate(input.incidentDate)) {
      return { success: false, message: t("action.report.futureDate"), errors: { incidentDate: t("action.report.futureDate") } };
    }
  }

  await db.report.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title.trim() }),
      ...(input.categoryId && { category: { connect: { id: input.categoryId } } }),
      ...(input.areaId && { area: { connect: { id: input.areaId } } }),
      ...(input.areaIds && input.areaIds.length > 0 && {
        areas: {
          set: Array.from(
            new Set([...(input.areaId ? [input.areaId] : []), ...input.areaIds])
          ).map((id) => ({ id })),
        },
      }),
      ...(input.facilityId !== undefined && {
        facility: input.facilityId 
          ? { connect: { id: input.facilityId } } 
          : { disconnect: true } 
      }),
      ...(input.locationDetail && { locationDetail: input.locationDetail.trim() }),
      ...(input.description && { description: input.description.trim() }),
      ...(input.incidentDate && { incidentDate: input.incidentDate }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
    },
  });

  await notifyUserReportEdited(session.userId, id);

  // Re-run smart match: edits to area/category/date can surface new opposite-type matches.
  // Only PUBLISHED reports participate (FOUND stays UNVERIFIED until admin verification).
  if (report.status === "PUBLISHED") {
    const matches = await findMatches(id);
    await createMatchNotifications(id, matches);
  }

  revalidatePath(`/report/${id}`);
  revalidatePath("/my-reports");
  revalidatePath("/found");
  revalidatePath("/lost");
  revalidatePath("/");

  return { success: true, message: t("action.report.updateSuccess") };
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteReport(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();
  const report = await db.report.findUnique({ where: { id } });

  if (!report) return { success: false, message: t("action.report.notFound") };
  if (report.authorId !== session.userId && session.role !== "ADMIN") {
    return { success: false, message: t("action.report.noDeleteAccess") };
  }
  if (report.status === "RESOLVED") {
    return { success: false, message: t("action.report.resolvedNoDelete") };
  }
  // FOUND reports that passed admin verification can no longer be deleted by the owner
  // (item is already publicly listed / may be claimed). LOST reports are exempt.
  if (report.type === "FOUND" && report.status === "PUBLISHED" && session.role !== "ADMIN") {
    return { success: false, message: t("action.report.publishedNoDelete") };
  }

  // Delete related notifications first (FK constraint), then report
  await db.notification.deleteMany({ where: { matchedReportId: id } });
  await db.report.delete({ where: { id } });

  // Self-notification after deletion (matchedReportId null — report gone, title snapshotted)
  await notifyUserReportDeleted(session.userId, report.title);

  revalidatePath("/my-reports");
  revalidatePath("/lost");
  revalidatePath("/found");
  revalidatePath("/");

  return { success: true, message: t("action.report.deleteSuccess") };
}

// ── Resolve ───────────────────────────────────────────────────────────────────
export async function resolveReport(
  id: string,
  takerName?: string,
  takerPhone?: string,
  takerIdCard?: string,
  takerPhotoUrl?: string,
  takerNotes?: string
): Promise<ActionResult> {
  const session = await requireSession();
  const t = await getT();

  // Find report along with claim to verify status
  const report = await db.report.findUnique({
    where: { id },
    include: { claim: true },
  });

  if (!report) return { success: false, message: t("action.report.notFound") };

  if (report.type === "FOUND") {
    if (session.role !== "ADMIN") {
      return { success: false, message: t("action.report.adminOnlyResolve") };
    }

    // If it has a claim, only takerName is needed (populated automatically from claimant)
    if (report.claim) {
      if (!takerName?.trim()) {
        return { success: false, message: t("action.report.takerNameRequired") };
      }
    } else {
      // If no claim, we require all offline details
      if (!takerName?.trim()) return { success: false, message: t("action.report.takerNameFullRequired") };
      if (!takerPhone?.trim()) return { success: false, message: t("action.report.takerPhoneRequired") };
      if (!takerIdCard?.trim()) return { success: false, message: t("action.report.takerIdRequired") };
      if (!takerPhotoUrl?.trim()) return { success: false, message: t("action.report.takerPhotoRequired") };
    }
  } else {
    if (report.authorId !== session.userId && session.role !== "ADMIN") {
      return { success: false, message: t("action.report.noResolveAccess") };
    }
  }

  if (report.status === "RESOLVED") {
    return { success: false, message: t("action.report.alreadyResolved") };
  }

  await db.report.update({ 
    where: { id }, 
    data: { 
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedBy: { connect: { id: session.userId } },
      takerName: report.type === "FOUND" ? takerName?.trim() : null,
      takerPhone: report.type === "FOUND" && !report.claim ? takerPhone?.trim() : null,
      takerIdCard: report.type === "FOUND" && !report.claim ? takerIdCard?.trim() : null,
      takerPhotoUrl: report.type === "FOUND" && !report.claim ? takerPhotoUrl?.trim() : null,
      takerNotes: report.type === "FOUND" && !report.claim ? takerNotes?.trim() || null : null,
    } 
  });

  // Notify claimer if FOUND report with claim is resolved
  if (report.type === "FOUND" && report.claim && takerName) {
    await notifyClaimerReportResolved(id);
  }
  // Self-record for whoever resolved it (admin for FOUND, owner for LOST)
  await notifyResolverDone(session.userId, id);

  revalidatePath(`/report/${id}`);
  revalidatePath("/my-reports");
  revalidatePath("/");

  return { success: true, message: t("action.report.resolveSuccess") };
}
