"use server";
/**
 * src/lib/actions/auth.actions.ts
 */
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, comparePassword, createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import type { ActionResult, RegisterInput, LoginInput } from "@/types";

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const { name, email, password } = input;
  if (!name.trim() || !email.trim() || !password)
    return { success: false, message: "Semua field wajib diisi." };
  if (password.length < 6)
    return { success: false, message: "Password minimal 6 karakter.", errors: { password: "Password minimal 6 karakter." } };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return { success: false, message: "Email sudah terdaftar.", errors: { email: "Email sudah terdaftar." } };

  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed },
  });

  const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  return { success: true, message: "Akun berhasil dibuat." };
}

export async function loginUser(input: LoginInput): Promise<ActionResult> {
  const { email, password } = input;
  if (!email.trim() || !password)
    return { success: false, message: "Email dan password wajib diisi." };

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !(await comparePassword(password, user.password)))
    return { success: false, message: "Email atau password salah.", errors: { email: " ", password: "Email atau password salah." } };

  const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  return { success: true, message: "Berhasil masuk.", data: { role: user.role } };
}

export async function logoutUser(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
