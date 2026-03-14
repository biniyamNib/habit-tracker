// middleware.ts  (or src/middleware.ts)

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const middleware = auth((req) => {
  // req.auth is now available (from JWT cookie)
  const isLoggedIn = !!req.auth?.user;

  // Example: protect /dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  return NextResponse.next();
});

// Matcher – only run on specific paths
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};

// Optional: force Node.js runtime for middleware (Next.js 15.2+ experimental)
// export const runtime = 'nodejs';   // Try this if you still get crypto error