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
    const postId = params.id;
    const userId = session.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, title: true }
    });
    if (!post) throw new ApiError('Post not found', 404);

    let isNewUpvote = false;

    const existing = await prisma.vote.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    isNewUpvote = voteType === 'UP' && (!existing || existing.type === 'DOWN');

    await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (!existing) {
        await tx.vote.create({ data: { userId, postId, type: voteType } });
        await updateReputation(tx, post.authorId, voteType === 'UP' ? 'POST_LIKED' : 'POST_DISLIKED', post.id);
      } else if (existing.type === voteType) {
        await tx.vote.delete({ where: { id: existing.id } });
        await updateReputation(
          tx,
          post.authorId,
          voteType === 'UP' ? 'POST_LIKED_REMOVED' : 'POST_DISLIKED_REMOVED',
          post.id
        );
      } else {
        await tx.vote.update({ where: { id: existing.id }, data: { type: voteType } });
        // Switching direction: reverse the old vote's reward, then apply the new one.
        await updateReputation(
          tx,
          post.authorId,
          existing.type === 'UP' ? 'POST_LIKED_REMOVED' : 'POST_DISLIKED_REMOVED',
          post.id
        );
        await updateReputation(tx, post.authorId, voteType === 'UP' ? 'POST_LIKED' : 'POST_DISLIKED', post.id);
      }
    });

    if (isNewUpvote && post.authorId !== session.user.id) {
      await createNotificationSafe({
        userId: post.authorId,
        type: 'POST_LIKED',
        title: 'Someone liked your post',
        body: `Your post "${post.title.slice(0, 60)}" received a like`,
        linkUrl: `/post/${post.id}`,
        actorName: session.user.name ?? undefined,
        actorImage: session.user.image ?? undefined,
        refId: post.id,
      });
    }

    const votes = await prisma.vote.findMany({ where: { postId }, select: { type: true, userId: true } });
    const voteCount = votes.filter((v) => v.type === 'UP').length - votes.filter((v) => v.type === 'DOWN').length;
    const mine = votes.find((v) => v.userId === userId);
    const userVote = mine ? (mine.type === 'UP' ? 'up' : 'down') : null;

    // Awaited (not fire-and-forget) — on Vercel's serverless runtime the
    // function can freeze the instant the response is sent, so an
    // un-awaited promise here may simply never run. Still wrapped in
    // try/catch so a milestone-check failure never fails the vote itself.
    try {
      await checkMilestones(post.authorId);
    } catch (err) {
      console.error('[checkMilestones] failed:', err);
    }

    return NextResponse.json({ voteCount, userVote });
  } catch (error) {
    return handleApiError(error);
  }
}
