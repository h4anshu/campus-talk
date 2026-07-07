import { prisma } from '@/lib/prisma';
import { updateReputation } from './updateReputation';

/** Checks one-time milestone bonuses for a user and awards any newly-crossed
 *  ones. Idempotent — re-running after a milestone was already logged is a
 *  no-op, since it checks `reputationLogs` for the reason key first. Meant
 *  to be called fire-and-forget after a vote/answer-accept response, not
 *  awaited inline with the request. */
export async function checkMilestones(userId: string) {
  const [user, acceptedAnswers, totalLikes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { reputation: true, reputationLogs: { select: { reason: true } } },
    }),
    prisma.comment.count({ where: { authorId: userId, accepted: true } }),
    prisma.vote.count({ where: { post: { authorId: userId }, type: 'UP' } }),
  ]);
  if (!user) return;

  const earnedReasons = new Set(user.reputationLogs.map((l) => l.reason));

  await prisma.$transaction(async (tx) => {
    if (acceptedAnswers >= 10 && !earnedReasons.has('TEN_HELPFUL_ANSWERS')) {
      await updateReputation(tx, userId, 'TEN_HELPFUL_ANSWERS');
    }
    if (totalLikes >= 50 && !earnedReasons.has('FIFTY_LIKES_TOTAL')) {
      await updateReputation(tx, userId, 'FIFTY_LIKES_TOTAL');
    }
  });
}
