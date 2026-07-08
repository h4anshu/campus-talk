import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function POST(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) throw new ApiError('User not found', 404);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        bannedAt: null,
        bannedReason: null,
      },
    });

    await createNotificationSafe({
      userId: user.id,
      type: 'ADMIN_WARNING',
      title: 'Your account has been restored',
      body: 'Your account access has been restored by admin.',
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
