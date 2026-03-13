// middleware.ts  (or middleware.js)
import { auth } from "./lib/auth";          // ← import from your root auth.ts file
import { NextResponse } from "next/server";

export default auth((req) => {
  // Optional: custom logic here (e.g., role checks, redirects)
  // Example: redirect to /dashboard if already signed in and trying to access /auth/signin
  const isSignedIn = !!req.auth;

  if (req.nextUrl.pathname.startsWith("/auth/signin") && isSignedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Default: continue to the next middleware or route
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - favicon.ico
     * - public files (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    // Explicitly protect dashboard and sub-routes
    "/dashboard/:path*",
  ],
};