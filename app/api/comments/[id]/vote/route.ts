import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { updateReputation } from '@/lib/updateReputation';
import { checkMilestones } from '@/lib/checkMilestones';

import { createNotificationSafe } from '@/lib/createNotification';

const voteSchema = z.object({ type: z.enum(['up', 'down']) });

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSessionOrThrow();
    const { type } = voteSchema.parse(await req.json());
    const voteType = type === 'up' ? 'UP' : 'DOWN';
    const commentId = params.id;
    const userId = session.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true, postId: true }
    });
    if (!comment) throw new ApiError('Comment not found', 404);

    let isNewUpvote = false;

    const existing = await prisma.vote.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    isNewUpvote = voteType === 'UP' && (!existing || existing.type === 'DOWN');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });

      // Only the 'up' direction carries a reputation effect for comments —
      // REPUTATION_POINTS has no COMMENT_DISLIKED entry, mirroring the UI
      // (CommentItem only ever exposes an upvote button, even though the
      // Vote model itself supports either direction here).
      if (!existing) {
        await tx.vote.create({ data: { userId, commentId, type: voteType } });
        if (voteType === 'UP') await updateReputation(tx, comment.authorId, 'COMMENT_LIKED', comment.id);
      } else if (existing.type === voteType) {
        await tx.vote.delete({ where: { id: existing.id } });
        if (voteType === 'UP') await updateReputation(tx, comment.authorId, 'COMMENT_LIKED_REMOVED', comment.id);
      } else {
        await tx.vote.update({ where: { id: existing.id }, data: { type: voteType } });
        if (existing.type === 'UP') await updateReputation(tx, comment.authorId, 'COMMENT_LIKED_REMOVED', comment.id);
        if (voteType === 'UP') await updateReputation(tx, comment.authorId, 'COMMENT_LIKED', comment.id);
      }
    });

    if (isNewUpvote && comment.authorId !== session.user.id) {
      await createNotificationSafe({
        userId: comment.authorId,
        type: 'COMMENT_LIKED',
        title: 'Someone liked your comment',
        body: 'Your comment received a like',
        linkUrl: `/post/${comment.postId}`,
        actorName: session.user.name ?? undefined,
        actorImage: session.user.image ?? undefined,
        refId: comment.id,
      });
    }

    const votes = await prisma.vote.findMany({ where: { commentId }, select: { type: true, userId: true } });
    const voteCount = votes.filter((v) => v.type === 'UP').length - votes.filter((v) => v.type === 'DOWN').length;
    const mine = votes.find((v) => v.userId === userId);
    const userVote = mine ? (mine.type === 'UP' ? 'up' : 'down') : null;

    checkMilestones(comment.authorId).catch(console.error);

    return NextResponse.json({ voteCount, userVote });
  } catch (error) {
    return handleApiError(error);
  }
}
