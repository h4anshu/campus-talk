import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { looseLimiter, getClientIp, applyRateLimit } from '@/lib/ratelimit';

// GET — fetch notifications for current user
export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await applyRateLimit(looseLimiter, getClientIp(req));
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionOrThrow();
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return handleApiError(error);
  }
}
