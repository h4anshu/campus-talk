import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { REPUTATION_POINTS } from './reputation';

/** Checks one-time milestone bonuses for a user and awards any newly-crossed
 *  ones. Meant to be called fire-and-forget after a vote/answer-accept
 *  response, not awaited inline with the request.
 *
 *  True idempotency now comes from a partial unique index on
 *  ReputationLog(userId, reason) scoped to just the milestone reasons (see
 *  prisma/migrations/20260712120000_add_milestone_unique_index and the
 *  comment on the ReputationLog model in schema.prisma) — not merely this
 *  function's own check. The `findFirst` below is kept only as a fast-path
 *  that skips the DB round-trip in the common, non-racing case; the index
 *  is what actually guarantees correctness when two calls race.
 *
 *  Each candidate milestone runs in its OWN transaction (not one shared
 *  transaction looping over all candidates). This matters: if a race is
 *  lost, `reputationLog.create` throws a real Postgres unique-violation,
 *  which leaves that transaction "aborted" — every later statement in the
 *  *same* Postgres transaction would then fail too, even a caught one. One
 *  candidate losing its race must not take down another candidate's own
 *  chance to be checked/awarded in the same call.
 *
 *  This also deliberately bypasses the shared `updateReputation` helper:
 *  it fires the log-create and the reputation-increment via `Promise.all`,
 *  so a losing create could still leave the increment applied. Here the
 *  create must fully succeed before the increment ever runs. */
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

  for (const reason of candidateReasons) {
    await prisma.$transaction(async (tx) => {
      const alreadyEarned = await tx.reputationLog.findFirst({ where: { userId, reason } });
      if (alreadyEarned) return; // fast-path — skips the DB round-trip in the common case

      const points = REPUTATION_POINTS[reason];
      try {
        await tx.reputationLog.create({ data: { userId, reason, points } });
        await tx.user.update({ where: { id: userId }, data: { reputation: { increment: points } } });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          // Lost the race to a concurrent call that committed this exact
          // milestone microseconds earlier — the partial unique index
          // caught it. Not an error: a no-op.
          return;
        }
        throw err;
      }
    });
  }
}
