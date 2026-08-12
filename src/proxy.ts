import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

// ============================================
// Proxy — Protect Admin Routes (Next.js 16)
// ============================================

const PROTECTED_ROUTES = ["/admin/dashboard"];
const LOGIN_ROUTE = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process admin routes
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isLoginPage = pathname === LOGIN_ROUTE;

  if (!isProtected && !isLoginPage) {
    return NextResponse.next();
  }

  // Read session cookie
  const sessionCookie = request.cookies.get("admin_session")?.value;
  const session = await decrypt(sessionCookie);
  const isAuthenticated =
    session !== null && new Date(session.expiresAt) > new Date();

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
