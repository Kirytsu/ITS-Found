/**
 * middleware.ts — Route Protection
 * Redirects unauthenticated users to login
 */
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const token = request.cookies.get("its-found-session")?.value;

  // Verify token
  let session = null;
  if (token) {
    session = await verifySession(token);
  }

  // If no valid session, redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png).*)",
  ],
};
