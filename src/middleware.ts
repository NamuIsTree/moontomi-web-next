import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "moontomi_admin_session";
const ADMIN_COOKIE_VALUE = "authenticated_moontomi_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").toLowerCase();
  const isAdminHost = host.startsWith("admin.");
  const isAuthenticated =
    request.cookies.get(ADMIN_COOKIE_NAME)?.value === ADMIN_COOKIE_VALUE;

  // Allow API routes and static assets through untouched
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/mock/") ||
    pathname.startsWith("/rank/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Case 1: Accessed via admin.* subdomain (e.g., admin.moontomi.com or admin.localhost:3000)
  if (isAdminHost) {
    const isLoginPath = pathname === "/login" || pathname === "/admin/login";

    if (isLoginPath) {
      if (isAuthenticated) {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = "/";
        return NextResponse.redirect(dashUrl);
      }
      const rewriteLogin = request.nextUrl.clone();
      rewriteLogin.pathname = "/admin/login";
      return NextResponse.rewrite(rewriteLogin);
    }

    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    const rewriteUrl = request.nextUrl.clone();
    if (!pathname.startsWith("/admin")) {
      rewriteUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    }
    return NextResponse.rewrite(rewriteUrl);
  }

  // Case 2: Accessed via /admin path on main domain
  if (pathname.startsWith("/admin")) {
    const isLoginPath = pathname === "/admin/login";

    if (isLoginPath) {
      if (isAuthenticated) {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = "/admin";
        return NextResponse.redirect(dashUrl);
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
