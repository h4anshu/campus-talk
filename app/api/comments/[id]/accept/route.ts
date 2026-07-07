import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { updateReputation } from '@/lib/updateReputation';
import { checkMilestones } from '@/lib/checkMilestones';

import { createNotificationSafe } from '@/lib/createNotification';

interface RouteParams {
  params: { id: string };
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    const commentId = params.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { id: true, authorId: true, title: true } } },
    });
    if (!comment) throw new ApiError('Comment not found', 404);
    if (comment.parentId !== null) {
      throw new ApiError('Only a top-level answer can be accepted', 400);
    }
    if (comment.post.authorId !== session.user.id) {
      throw new ApiError('Only the post author can accept an answer', 403);
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.updateMany({
        where: { postId: comment.post.id, accepted: true },
        data: { accepted: false },
      });
      await tx.comment.update({
        where: { id: commentId },
        data: { accepted: true },
      });
      await updateReputation(tx, comment.authorId, 'ANSWER_ACCEPTED', comment.id);
    });

    if (comment.authorId !== session.user.id) {
      await createNotificationSafe({
        userId: comment.authorId,
        type: 'ANSWER_ACCEPTED',
        title: 'Your answer was marked as helpful',
        body: `Your answer on "${comment.post.title.slice(0, 60)}" was accepted`,
        linkUrl: `/post/${comment.post.id}`,
        refId: comment.id,
      });
    }

    checkMilestones(comment.authorId).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
