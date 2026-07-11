import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { deleteUserSchema } from '@/lib/validations/admin-user';
import { updateReputation } from '@/lib/updateReputation';

interface RouteParams {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const data = deleteUserSchema.parse(await req.json().catch(() => ({})));

    const existing = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    });
    if (!existing) throw new ApiError('User not found', 404);
    if (existing.role === 'ADMIN') throw new ApiError('Cannot delete an admin account', 403);

    await prisma.$transaction(async (tx) => {
      if (data.blockEmail) {
        await tx.bannedEmail.upsert({
          where: { email: existing.email },
          update: { reason: data.reason ?? null },
          create: {
            email: existing.email,
            reason: data.reason ?? null,
            bannedBy: 'admin',
          },
        });
      }

      // This user's own Vote rows cascade away with them, but the
      // reputation those votes granted to OTHER users doesn't self-heal
      // the way vote counts do (recomputed live from Vote rows) — it's a
      // denormalized counter that must be explicitly reversed here, using
      // the same *_REMOVED reasons the vote routes themselves use when a
      // vote is retracted, so this stays part of the normal ReputationLog
      // audit trail instead of a raw, unlogged increment.
      const outgoingVotes = await tx.vote.findMany({
        where: { userId: params.id },
        select: {
          type: true,
          post: { select: { id: true, authorId: true } },
          comment: { select: { id: true, authorId: true } },
        },
      });
      for (const vote of outgoingVotes) {
        if (vote.post && vote.post.authorId !== params.id) {
          const reason = vote.type === 'UP' ? 'POST_LIKED_REMOVED' : 'POST_DISLIKED_REMOVED';
          await updateReputation(tx, vote.post.authorId, reason, vote.post.id);
        } else if (vote.comment && vote.comment.authorId !== params.id && vote.type === 'UP') {
          // No COMMENT_DISLIKED reason exists — comment downvotes never
          // granted reputation in the first place (matches the comment
          // vote route), so there's nothing to reverse for those.
          await updateReputation(tx, vote.comment.authorId, 'COMMENT_LIKED_REMOVED', vote.comment.id);
        }
      }

      // Posts/comments/votes/sessions all cascade via onDelete: Cascade.
      await tx.user.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
