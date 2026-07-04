import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';

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

    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
    if (!comment) throw new ApiError('Comment not found', 404);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });

      if (!existing) {
        await tx.vote.create({ data: { userId, commentId, type: voteType } });
      } else if (existing.type === voteType) {
        await tx.vote.delete({ where: { id: existing.id } });
      } else {
        await tx.vote.update({ where: { id: existing.id }, data: { type: voteType } });
      }
    });

    const votes = await prisma.vote.findMany({ where: { commentId }, select: { type: true, userId: true } });
    const voteCount = votes.filter((v) => v.type === 'UP').length - votes.filter((v) => v.type === 'DOWN').length;
    const mine = votes.find((v) => v.userId === userId);
    const userVote = mine ? (mine.type === 'UP' ? 'up' : 'down') : null;

    return NextResponse.json({ voteCount, userVote });
  } catch (error) {
    return handleApiError(error);
  }
}
