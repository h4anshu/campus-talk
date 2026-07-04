import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { ADMIN_COOKIE_NAME, signAdminSession } from '@/lib/admin-auth';

const loginSchema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const { password } = loginSchema.parse(await req.json());

    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) throw new ApiError('Admin login is not configured', 500);

    const valid = await bcrypt.compare(password, hash);
    if (!valid) throw new ApiError('Incorrect password', 401);

    (await cookies()).set(ADMIN_COOKIE_NAME, signAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
