import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/home', '/discussions', '/spaces',
  '/post', '/profile', '/saved', '/admin'];

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
    '/admin/:path*',
  ]
};
