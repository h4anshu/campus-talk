import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { createNotificationSafe } from '@/lib/createNotification';

const moderateSchema = z.object({
  action: z.enum(['PIN', 'UNPIN', 'LOCK', 'UNLOCK', 'REMOVE']),
});

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { action } = moderateSchema.parse(await req.json());

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true, pinned: true, locked: true, status: true },
    });
    if (!post) throw new ApiError('Post not found', 404);

    let data: { pinned?: boolean; locked?: boolean; status?: 'REMOVED' };
    switch (action) {
      case 'PIN':
        data = { pinned: true };
        break;
      case 'UNPIN':
        data = { pinned: false };
        break;
      case 'LOCK':
        data = { locked: true };
        break;
      case 'UNLOCK':
        data = { locked: false };
        break;
      case 'REMOVE':
        data = { status: 'REMOVED' };
        break;
    }

    const updated = await prisma.post.update({ where: { id: params.id }, data });

    // Matches the report-action route's REMOVE_POST notification exactly
    // (same type/body/linkUrl/refId), since this is the same event from the
    // author's perspective — their post was removed by an admin.
    if (action === 'REMOVE' && post.status !== 'REMOVED') {
      await createNotificationSafe({
        userId: post.authorId,
        type: 'POST_REMOVED_BY_ADMIN',
        title: 'Your post was removed',
        body: 'Your post was removed for violating community guidelines.',
        linkUrl: `/post/${post.id}`,
        refId: post.id,
      });
    }

    return NextResponse.json({
      id: updated.id,
      pinned: updated.pinned,
      locked: updated.locked,
      status: updated.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
