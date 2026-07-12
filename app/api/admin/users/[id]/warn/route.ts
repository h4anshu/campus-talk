import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { warnUserSchema } from '@/lib/validations/admin-user';
import { createNotificationSafe } from '@/lib/createNotification';
import { strictLimiter, getClientIp, applyRateLimit } from '@/lib/ratelimit';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await applyRateLimit(strictLimiter, getClientIp(req));
    if (rateLimitResponse) return rateLimitResponse;

    await requireAdmin();
    const data = warnUserSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!existing) throw new ApiError('User not found', 404);
    if (existing.role === 'ADMIN') throw new ApiError('Cannot warn an admin account', 403);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        warningCount: { increment: 1 },
        status: 'WARNED',
      },
    });

    await createNotificationSafe({
      userId: user.id,
      type: 'ADMIN_WARNING',
      title: 'Warning from admin',
      body: data.message,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
