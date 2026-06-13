"use server";
/**
 * src/lib/actions/auth.actions.ts
 */
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, comparePassword, createSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import type { ActionResult, RegisterInput, LoginInput } from "@/types";

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const t = await getT();
  const { name, email, password } = input;
  if (!name.trim() || !email.trim() || !password)
    return { success: false, message: t("action.auth.allFieldsRequired") };
  if (password.length < 6)
    return { success: false, message: t("action.auth.passwordMinLength"), errors: { password: t("action.auth.passwordMinLength") } };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return { success: false, message: t("action.auth.emailTaken"), errors: { email: t("action.auth.emailTaken") } };

  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed },
  });

  const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  return { success: true, message: t("action.auth.registerSuccess") };
}

export async function loginUser(input: LoginInput): Promise<ActionResult> {
  const t = await getT();
  const { email, password } = input;
  if (!email.trim() || !password)
    return { success: false, message: t("action.auth.emailPasswordRequired") };

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !(await comparePassword(password, user.password)))
    return { success: false, message: t("action.auth.invalidCredentials"), errors: { email: " ", password: t("action.auth.invalidCredentials") } };

  const token = await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  return { success: true, message: t("action.auth.loginSuccess"), data: { role: user.role } };
}

export async function logoutUser(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
