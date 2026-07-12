import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { serializePost, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';
import { createNotificationSafe } from '@/lib/createNotification';
import { z } from 'zod';

const updateCollabSchema = z.object({
  action: z.enum(['increment', 'decrement']).optional(),
  isClosed: z.boolean().optional(),
  deadline: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionOrThrow();
    const postId = params.id;
    const json = await req.json();
    const data = updateCollabSchema.parse(json);

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (post.space !== 'COLLABORATION') {
      return NextResponse.json({ error: 'Not a collaboration post' }, { status: 400 });
    }

    // Atomic at the database level: updateMany's `where` guard either
    // matches and applies the delta, or matches zero rows. This eliminates
    // the old read-then-write-absolute race, where two concurrent "+1"s
    // could both read the same starting count and overwrite each other.
    if (data.action === 'increment') {
      const totalSlots = post.collabTotalSlots ?? 0;
      const { count } = await prisma.post.updateMany({
        where: { id: postId, collabFilledSlots: { lt: totalSlots } },
        data: { collabFilledSlots: { increment: 1 } },
      });
      if (count === 0) {
        return NextResponse.json({ error: 'All slots already filled' }, { status: 409 });
      }
    } else if (data.action === 'decrement') {
      const { count } = await prisma.post.updateMany({
        where: { id: postId, collabFilledSlots: { gt: 0 } },
        data: { collabFilledSlots: { decrement: 1 } },
      });
      if (count === 0) {
        return NextResponse.json({ error: 'Already at zero' }, { status: 409 });
      }
    }

    // isClosed / deadline are a separate action from the slot count (the UI
    // never sends them together with `action`) — kept as a direct set, same
    // as before.
    const wasClosed = post.collabIsClosed;
    let nextIsClosed = post.collabIsClosed;
    if (typeof data.isClosed === 'boolean' || data.deadline !== undefined) {
      if (typeof data.isClosed === 'boolean') nextIsClosed = data.isClosed;
      const nextDeadline = data.deadline !== undefined
        ? (data.deadline ? new Date(data.deadline) : null)
        : post.collabDeadline;

      await prisma.post.update({
        where: { id: postId },
        data: { collabIsClosed: nextIsClosed, collabDeadline: nextDeadline },
      });
    }

    if (!wasClosed && nextIsClosed) {
      await createNotificationSafe({
        userId: session.user.id,
        type: 'COLLAB_SLOT_FILLED',
        title: 'Team Full',
        body: `Your collaboration post "${post.title}" is now marked as complete.`,
        linkUrl: `/post/${post.id}`,
        refId: post.id,
      });
    }

    const updated = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        ...POST_INCLUDE,
        savedBy: { where: { userId: session.user.id }, select: { userId: true } },
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });
    if (!updated) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(serializePost(updated as PostForSerialization, session.user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
