import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("devforge_guest")?.value;

  const isProtectedDashboardRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/dashboard/leads");

  const isProtectedApiRoute =
    pathname.startsWith("/api/deploy") ||
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/leads");

  // In development mode, auto-bypass or allow direct dashboard access for friction-free testing
  const isDev = process.env.NODE_ENV !== "production";

  if (!sessionToken && !isDev) {
    if (isProtectedDashboardRoute) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }

    if (isProtectedApiRoute) {
      return NextResponse.json({ error: "Unauthorized — authentication required" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/deploy",
    "/api/projects/:path*",
    "/api/leads/:path*",
  ],
};
