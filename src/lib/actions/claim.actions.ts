"use server";
/**
 * src/lib/actions/claim.actions.ts
 * Server Actions for Claiming FOUND reports.
 */
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { requireSession } from "../auth";
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

  // 1. Validate inputs
  if (!reportId) {
    return { success: false, message: "ID laporan tidak valid." };
  }
  if (!photoUrl) {
    return { success: false, message: "Foto bukti pengambilan/kepemilikan wajib diunggah." };
  }

  // 2. Validate roles
  if (session.role === "ADMIN") {
    return { success: false, message: "Admin tidak diperbolehkan melakukan klaim barang." };
  }

  try {
    // 3. Find and check report eligibility
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { claim: true },
    });

    if (!report) {
      return { success: false, message: "Laporan tidak ditemukan." };
    }

    if (report.type !== "FOUND") {
      return { success: false, message: "Hanya laporan penemuan (FOUND) yang dapat diklaim." };
    }

    if (report.status !== "PUBLISHED") {
      return { success: false, message: "Barang tidak dalam status yang dapat diklaim." };
    }

    if (report.authorId === session.userId) {
      return { success: false, message: "Pembuat laporan penemuan tidak boleh mengklaim barangnya sendiri." };
    }

    if (report.claim) {
      return { success: false, message: "Barang ini sudah diklaim oleh pengguna lain." };
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
    await createClaimNotification(reportId, session.userId);
    // Notify admins to mark this report as resolved after verification
    await notifyAdminsClaimMade(reportId, session.name);

    // 5. Revalidate relevant paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");

    return {
      success: true,
      message: "Klaim berhasil diajukan! Silakan hubungi fasilitas penitipan terkait untuk pengambilan barang fisik.",
      data: { claimId: claim.id },
    };
  } catch (error) {
    // Handle database unique constraint (race condition)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return {
        success: false,
        message: "Barang ini baru saja diklaim oleh pengguna lain.",
      };
    }
    console.error("[Create Claim Error]", error);
    return { success: false, message: "Terjadi kesalahan saat memproses klaim." };
  }
}

/**
 * Cancels a claim for a FOUND report.
 */
export async function cancelClaim(reportId: string): Promise<ActionResult> {
  const session = await requireSession();

  if (!reportId) {
    return { success: false, message: "ID laporan tidak valid." };
  }

  try {
    // 1. Fetch report and claim
    const report = await db.report.findUnique({
      where: { id: reportId },
      include: { claim: true },
    });

    if (!report) {
      return { success: false, message: "Laporan tidak ditemukan." };
    }

    const claim = report.claim;
    if (!claim) {
      return { success: false, message: "Klaim tidak ditemukan untuk laporan ini." };
    }

    // 2. Validate authorization
    if (claim.userId !== session.userId) {
      return { success: false, message: "Anda tidak memiliki akses untuk membatalkan klaim ini." };
    }

    // 3. Validate report status
    if (report.status === "RESOLVED") {
      return { success: false, message: "Klaim tidak dapat dibatalkan karena barang sudah diambil dan laporan diselesaikan." };
    }

    // 4. Delete Claim
    await db.claim.delete({
      where: { id: claim.id },
    });

    // 4.5 Send notification to report author
    const claimant = await db.user.findUnique({
      where: { id: claim.userId },
    });
    if (claimant) {
      await createClaimCancelledNotification(reportId, claimant.name);
    }

    // 5. Revalidate paths
    revalidatePath(`/report/${reportId}`);
    revalidatePath("/found");
    revalidatePath("/");

    return {
      success: true,
      message: "Klaim Anda berhasil dibatalkan.",
    };
  } catch (error) {
    console.error("[Cancel Claim Error]", error);
    return { success: false, message: "Terjadi kesalahan saat membatalkan klaim." };
  }
}
