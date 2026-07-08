import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { banUserSchema } from '@/lib/validations/admin-user';
import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const data = banUserSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });
    if (!existing) throw new ApiError('User not found', 404);
    if (existing.role === 'ADMIN') throw new ApiError('Cannot ban an admin account', 403);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: 'BANNED',
        bannedAt: new Date(),
        bannedReason: data.reason,
      },
    });

    await createNotificationSafe({
      userId: user.id,
      type: 'ADMIN_WARNING',
      title: 'Your account has been suspended',
      body: data.reason,
    });

    // Kick the user out immediately — session strategy is 'database', so
    // deleting their Session rows makes the next auth() call anywhere
    // (page, API route) return null right away, no stale-cookie window.
    await prisma.session.deleteMany({ where: { userId: params.id } });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
