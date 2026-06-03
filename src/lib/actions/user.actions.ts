"use server";
/**
 * src/lib/actions/user.actions.ts
 * User profile and account management actions.
 */
import { db } from "../db";
import { requireSession } from "../auth";
import type { ActionResult } from "../../types";

/** Get current user profile details. */
export async function getUserProfile() {
    const session = await requireSession();

    const user = await db.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    reports: true,
                    notifications: true,
                },
            },
        },
    });

    if (!user) throw new Error("User not found");

    return user;
}

/** Get all reports authored by current user. */
export async function getUserReports() {
    const session = await requireSession();

    return db.report.findMany({
        where: { authorId: session.userId },
        include: {
            category: true,
            area: true,
            facility: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

/** Update user profile. */
export async function updateUserProfile(input: {
    name?: string;
}): Promise<ActionResult> {
    const session = await requireSession();

    if (input.name && !input.name.trim()) {
        return { success: false, message: "Nama tidak boleh kosong." };
    }

    const user = await db.user.update({
        where: { id: session.userId },
        data: {
            name: input.name?.trim(),
        },
    });

    return { success: true, message: "Profil berhasil diperbarui.", data: user };
}
