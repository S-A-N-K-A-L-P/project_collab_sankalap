import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;

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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/feed", 
    "/notifications", 
    "/discover", 
    "/profile/:path*", 
    "/settings", 
    "/admin",
    "/ideas",
    "/user/:path*"
  ],
};
