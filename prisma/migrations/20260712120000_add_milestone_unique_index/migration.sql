-- Enforces true DB-level idempotency for one-time milestone reputation
-- events. Scoped to only the milestone reasons (FIRST_POST,
-- TEN_HELPFUL_ANSWERS, FIFTY_LIKES_TOTAL — the "Milestones (one-time)"
-- section of lib/reputation.ts) via a partial index, so repeatable events
-- (POST_LIKED, COMMENT_LIKED, ANSWER_ACCEPTED, etc.) are unaffected and can
-- still log many rows per user. Prisma's schema.prisma has no DSL for a
-- filtered/partial unique index, so this exists only as hand-written SQL —
-- see the comment on the ReputationLog model in schema.prisma.
CREATE UNIQUE INDEX "unique_milestone_per_user"
ON "ReputationLog" ("userId", "reason")
WHERE "reason" IN ('FIRST_POST', 'TEN_HELPFUL_ANSWERS', 'FIFTY_LIKES_TOTAL');
