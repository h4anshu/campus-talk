import type { prisma } from '@/lib/prisma';
import { REPUTATION_POINTS, type ReputationReason } from './reputation';

type ReputationClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/** Atomically applies a reputation delta and logs why. Pass the `tx` client
 *  from inside a `prisma.$transaction(async (tx) => ...)` callback so the
 *  reputation change commits (or rolls back) together with whatever
 *  triggered it — or pass the bare `prisma` client directly if no wrapping
 *  transaction exists. */
export async function updateReputation(
  tx: ReputationClient,
  userId: string,
  reason: ReputationReason,
  refId?: string
) {
  const points = REPUTATION_POINTS[reason];
  await Promise.all([
    tx.user.update({
      where: { id: userId },
      data: { reputation: { increment: points } },
    }),
    tx.reputationLog.create({
      data: { userId, points, reason, refId },
    }),
  ]);
}
