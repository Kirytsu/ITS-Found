/**
 * src/lib/auth.ts
 * Authentication utilities: password hashing and JWT session management.
 * Uses bcryptjs for hashing and jose for JWT (edge-runtime compatible).
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "../types";

// ─── Config ───────────────────────────────────────────────────────────────────
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "its-found-secret-change-in-production"
);
const COOKIE_NAME = "its-found-session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// ─── Password ─────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────
export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers (Server Components / Server Actions only) ─────────────────
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Returns the decoded session for the current request.
 * Returns null if no valid session cookie is present.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Convenience: get session and throw if unauthenticated. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

/** Convenience: get session and throw if not ADMIN. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
