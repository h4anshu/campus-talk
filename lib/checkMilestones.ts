import { prisma } from '@/lib/prisma';
import { updateReputation } from './updateReputation';

/** Checks one-time milestone bonuses for a user and awards any newly-crossed
 *  ones. Meant to be called fire-and-forget after a vote/answer-accept
 *  response, not awaited inline with the request.
 *
 *  The already-earned check now happens inside the same transaction as
 *  each award, immediately before its ReputationLog entry is created —
 *  this narrows the race window from "one check for every candidate
 *  milestone, then separate awards" down to "check-then-create per
 *  milestone, inside one transaction." It does NOT fully eliminate the
 *  race: under Postgres's default READ COMMITTED isolation, two concurrent
 *  calls can still both SELECT "not yet earned" before either commits its
 *  INSERT, since there's no unique constraint on (userId, reason) to make
 *  the second INSERT fail. A complete fix would need SERIALIZABLE
 *  isolation or a unique index scoped to just the milestone-type reasons —
 *  not applied here, since `reason` is also used for repeatable events
 *  (POST_LIKED, COMMENT_LIKED, etc.) and a blanket unique constraint on it
 *  would break those. */
export async function checkMilestones(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return;

  const [acceptedAnswers, totalLikes] = await Promise.all([
    prisma.comment.count({ where: { authorId: userId, accepted: true } }),
    prisma.vote.count({ where: { post: { authorId: userId }, type: 'UP' } }),
  ]);

  const candidateReasons: Array<'TEN_HELPFUL_ANSWERS' | 'FIFTY_LIKES_TOTAL'> = [];
  if (acceptedAnswers >= 10) candidateReasons.push('TEN_HELPFUL_ANSWERS');
  if (totalLikes >= 50) candidateReasons.push('FIFTY_LIKES_TOTAL');
  if (candidateReasons.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const reason of candidateReasons) {
      const alreadyEarned = await tx.reputationLog.findFirst({ where: { userId, reason } });
      if (alreadyEarned) continue; // already awarded — even by a concurrent call that just committed
      await updateReputation(tx, userId, reason);
    }
  });
}
