import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/landing', origin));
  }

  if (pathname.startsWith('/admin') && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/home', origin));
  }
});

export const config = {
  matcher: [
    '/home/:path*',
    '/discussions/:path*',
    '/spaces/:path*',
    '/post/:path*',
    '/profile/:path*',
    '/saved/:path*',
    '/admin/:path*',
  ],
};
