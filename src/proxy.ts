/**
 * src/middleware.ts
 * Route protection middleware:
 * - Redirects unauthenticated users to /login for all (main) routes
 * - Redirects non-ADMIN users away from /admin/* routes
 * - Redirects authenticated users away from /login and /register
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import type { SessionPayload } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "its-found-secret-change-in-production"
);
const COOKIE_NAME = "its-found-session";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/report",
  "/my-reports",
  "/admin",
  "/settings",
];

// Routes that should redirect to / if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

async function getSessionFromRequest(
  req: NextRequest
): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  // ── Redirect authenticated users away from auth pages ──────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ── Protect main routes ────────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin-only guard ───────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
