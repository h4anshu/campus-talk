import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// '/admin' is intentionally NOT here — admin auth is a completely separate
// signed-cookie system (see lib/admin-auth.ts), unrelated to the student
// NextAuth session this middleware checks for below. Its own gating happens
// server-side in app/admin/(protected)/layout.tsx.
const protectedRoutes = ['/home', '/discussions', '/spaces',
  '/post', '/profile', '/saved', '/tickets', '/leaderboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  // Check for NextAuth session cookie
  const sessionCookie =
    request.cookies.get('authjs.session-token') ??
    request.cookies.get('__Secure-authjs.session-token');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/discussions/:path*',
    '/spaces/:path*',
    '/post/:path*',
    '/profile/:path*',
    '/saved/:path*',
    '/tickets/:path*',
    '/leaderboard/:path*',
  ]
};
