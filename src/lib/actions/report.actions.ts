"use server";
/**
 * src/lib/actions/report.actions.ts
 * CRUD Server Actions for Reports.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireSession } from "../auth";
import { findMatches, createMatchNotifications } from "./notification.actions";
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
  facility: true,
  verifiedBy: { select: { name: true } },
  resolvedBy: { select: { name: true } },
} as const;

// ── Create ────────────────────────────────────────────────────────────────────
export async function createReport(
  input: CreateReportInput
): Promise<ActionResult> {
  const session = await requireSession();

  // Validation
  if (!input.title.trim()) return { success: false, message: "Judul wajib diisi." };
  if (!input.categoryId) return { success: false, message: "Kategori wajib dipilih." };
  if (!input.areaId) return { success: false, message: "Area wajib dipilih." };
  if (!input.description.trim()) return { success: false, message: "Deskripsi wajib diisi." };
  if (!input.locationDetail.trim()) return { success: false, message: "Lokasi kejadian wajib diisi." };
  if (input.type === "FOUND" && !input.facilityId) {
    return { success: false, message: "Fasilitas tempat penyimpanan wajib dipilih untuk laporan penemuan." };
  }

  // LOST → PUBLISHED immediately; FOUND → UNVERIFIED (needs admin verification)
  const status = input.type === "LOST" ? "PUBLISHED" : "UNVERIFIED";

  const report = await db.report.create({
    data: {
      title: input.title.trim(),
      type: input.type,
      status,
      categoryId: input.categoryId,
      areaId: input.areaId,
      facilityId: input.facilityId ?? null,
      locationDetail: input.locationDetail.trim(),
      description: input.description.trim(),
      incidentDate: input.incidentDate,
      imageUrl: input.imageUrl ?? null,
      authorId: session.userId,
    },
  });

  // Smart Match: only run for PUBLISHED reports
  if (status === "PUBLISHED") {
    const matches = await findMatches(report.id);
    await createMatchNotifications(report.id, matches);
  }

  revalidatePath("/");
  revalidatePath(input.type === "LOST" ? "/lost" : "/found");

  return {
    success: true,
    message: "Laporan berhasil dibuat.",
    data: { reportId: report.id },
  };
}

// ── Read: Public List ─────────────────────────────────────────────────────────
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

  const where: Record<string, unknown> = {
    type,
    status: filters.status || "PUBLISHED",
    ...(areaId && { areaId }),
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
    ...(areaId && { areaId }),
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
  const report = await db.report.findUnique({ where: { id } });

  if (!report) return { success: false, message: "Laporan tidak ditemukan." };
  if (report.authorId !== session.userId && session.role !== "ADMIN") {
    return { success: false, message: "Anda tidak memiliki akses untuk mengubah laporan ini." };
  }
  if (report.status === "RESOLVED") {
    return { success: false, message: "Laporan yang sudah selesai tidak dapat diubah." };
  }

  await db.report.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title.trim() }),
      ...(input.categoryId && { categoryId: input.categoryId }),
      ...(input.areaId && { areaId: input.areaId }),
      ...(input.facilityId !== undefined && { facilityId: input.facilityId }),
      ...(input.locationDetail && { locationDetail: input.locationDetail.trim() }),
      ...(input.description && { description: input.description.trim() }),
      ...(input.incidentDate && { incidentDate: input.incidentDate }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
    },
  });

  revalidatePath(`/report/${id}`);
  revalidatePath("/my-reports");

  return { success: true, message: "Laporan berhasil diperbarui." };
}

// ── Delete ────────────────────────────────────────────────────────────────────
export async function deleteReport(id: string): Promise<ActionResult> {
  const session = await requireSession();
  const report = await db.report.findUnique({ where: { id } });

  if (!report) return { success: false, message: "Laporan tidak ditemukan." };
  if (report.authorId !== session.userId && session.role !== "ADMIN") {
    return { success: false, message: "Anda tidak memiliki akses untuk menghapus laporan ini." };
  }
  if (report.status === "RESOLVED") {
    return { success: false, message: "Laporan yang sudah selesai tidak dapat dihapus." };
  }

  // Delete related notifications first (FK constraint)
  await db.notification.deleteMany({ where: { matchedReportId: id } });
  await db.report.delete({ where: { id } });

  revalidatePath("/my-reports");
  revalidatePath("/");

  return { success: true, message: "Laporan berhasil dihapus." };
}

// ── Resolve ───────────────────────────────────────────────────────────────────
export async function resolveReport(id: string, takerName?: string): Promise<ActionResult> {
  const session = await requireSession();
  const report = await db.report.findUnique({ where: { id } });

  if (!report) return { success: false, message: "Laporan tidak ditemukan." };

  if (report.type === "FOUND") {
    if (session.role !== "ADMIN") {
      return { success: false, message: "Hanya Admin yang dapat menyelesaikan laporan penemuan." };
    }
    if (!takerName?.trim()) {
      return { success: false, message: "Nama pengambil wajib diisi." };
    }
  } else {
    if (report.authorId !== session.userId && session.role !== "ADMIN") {
      return { success: false, message: "Anda tidak memiliki akses untuk menyelesaikan laporan ini." };
    }
  }

  if (report.status === "RESOLVED") {
    return { success: false, message: "Laporan sudah berstatus selesai." };
  }

  await db.report.update({ 
    where: { id }, 
    data: { 
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedById: session.userId,
      takerName: report.type === "FOUND" ? takerName?.trim() : null,
    } 
  });

  revalidatePath(`/report/${id}`);
  revalidatePath("/my-reports");
  revalidatePath("/");

  return { success: true, message: "Laporan berhasil ditandai selesai." };
}
