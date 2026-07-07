import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { updateReputation } from '@/lib/updateReputation';
import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true, title: true, type: true, status: true }
    });
    if (!existing) throw new ApiError('Post not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: params.id },
        data: { status: 'APPROVED', rejectionReason: null },
      });

      // Only award the approval bonus on a genuine pending->approved
      // transition, so re-hitting this route (e.g. a duplicate request)
      // can't double-award it.
      if (existing.type === 'SPACE' && existing.status === 'PENDING') {
        await updateReputation(tx, existing.authorId, 'SPACE_POST_APPROVED', existing.id);
      }
    });

    await createNotificationSafe({
      userId: existing.authorId,
      type: 'POST_APPROVED',
      title: 'Your post was approved',
      body: `Your post "${existing.title.slice(0, 60)}" is now live`,
      linkUrl: `/post/${existing.id}`,
      refId: existing.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
