import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth';

export async function POST() {
  (await cookies()).set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return NextResponse.json({ success: true });
}
