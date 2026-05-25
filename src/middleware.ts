
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["admin", "pixel_head"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect legacy dashboard routes to new routes
  if (path.startsWith("/dashboard")) {
    const subPath = path.replace("/dashboard", "");
    if (subPath === "" || subPath === "/feed") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
    if (subPath.startsWith("/profile/")) {
      return NextResponse.redirect(new URL(subPath, req.url));
    }
    return NextResponse.redirect(new URL(subPath || "/feed", req.url));
  }

  if (path.startsWith("/user/")) {
    const id = path.split("/")[2];
    return NextResponse.redirect(new URL(`/profile/${id}`, req.url));
  }

  // Admin route handling — completely separate from general auth
  if (path.startsWith("/admin")) {
    const isAdminAuthPage = path === "/admin/login" || path === "/admin/register";

    if (isAdminAuthPage) {
      // Redirect already-authenticated admins away from auth pages
      if (token && ADMIN_ROLES.includes((token as any).role)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // All other /admin/* routes need auth + admin role
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (!ADMIN_ROLES.includes((token as any).role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return NextResponse.next();
  }

  // General app protected routes
  const isProtectedRoute =
    path.startsWith("/feed") ||
    path.startsWith("/notifications") ||
    path.startsWith("/discover") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/ideas") ||
    path.startsWith("/project_tracker");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/feed",
    "/notifications",
    "/discover",
    "/profile/:path*",
    "/settings",
    "/admin/:path*",
    "/ideas/:path*",
    "/user/:path*",
    "/project_tracker/:path*",
  ],
};
