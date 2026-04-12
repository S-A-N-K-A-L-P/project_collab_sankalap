
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Get token from JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect legacy dashboard routes to new routes
  if (path.startsWith("/dashboard")) {
    const subPath = path.replace("/dashboard", "");

    // Handle specific renames
    if (subPath === "" || subPath === "/feed") {
      return NextResponse.redirect(new URL("/feed", req.url));
    }
    if (subPath.startsWith("/profile/")) {
      return NextResponse.redirect(new URL(subPath, req.url));
    }

    // Fallback: try to redirect to the subpath directly if it exists in the new structure
    return NextResponse.redirect(new URL(subPath || "/feed", req.url));
  }

  if (path.startsWith("/user/")) {
    const id = path.split("/")[2];
    return NextResponse.redirect(new URL(`/profile/${id}`, req.url));
  }

  // Protected routes: /dashboard, /admin, and /(app)
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/feed") ||
    path.startsWith("/notifications") ||
    path.startsWith("/discover") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/ideas") ||
    // Match routes under /(app) - these are the actual app routes
    path.startsWith("/admin") ||
    path.startsWith("/project_tracker");

  if (isProtectedRoute) {
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Check for admin-only routes
    const isAdminRoute = path.startsWith("/admin");
    const userRole = token.role as string;

    if (isAdminRoute && userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
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
