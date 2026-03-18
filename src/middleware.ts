import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect legacy routes to their new dashboard counterparts
    if (path === "/dashboard" || path === "/feed" || path.startsWith("/proposals")) {
      return NextResponse.redirect(new URL("/dashboard/feed", req.url));
    }

    if (path.startsWith("/user/")) {
      const id = path.split("/")[2];
      return NextResponse.redirect(new URL(`/dashboard/profile/${id}`, req.url));
    }

    // Role-based protection for specific dashboard sub-routes
    if (path.startsWith("/dashboard/member") && token?.role !== "pixel_member") {
      return NextResponse.redirect(new URL("/dashboard/user", req.url));
    }

    if (path.startsWith("/dashboard/user") && token?.role !== "normal_user") {
      return NextResponse.redirect(new URL("/dashboard/member", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/feed", "/proposals", "/user/:path*"],
};
