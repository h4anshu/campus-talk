import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { createNotificationSafe } from '@/lib/createNotification';
import { slugify } from '@/lib/utils';

const rejectSchema = z.object({ reason: z.string().trim().max(500).optional() });

interface RouteParams {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { reason } = rejectSchema.parse(await req.json().catch(() => ({})));

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError('Post not found', 404);
    if (existing.status !== 'PENDING') {
      throw new ApiError('Only pending posts can be rejected', 400);
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: { status: 'REJECTED', rejectionReason: reason ?? null },
      include: { author: { select: { name: true } } },
    });

    await createNotificationSafe({
      userId: updatedPost.authorId,
      type: 'POST_REJECTED',
      title: 'Your post was not approved',
      body: updatedPost.rejectionReason
        ? `Reason: ${updatedPost.rejectionReason}`
        : `Your post "${updatedPost.title.slice(0, 60)}" was rejected by admin`,
      linkUrl: `/profile/${slugify(updatedPost.author.name)}`,
      refId: updatedPost.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
