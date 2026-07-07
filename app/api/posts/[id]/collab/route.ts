import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError } from '@/lib/api-helpers';
import { serializePost, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';
import { createNotificationSafe } from '@/lib/createNotification';
import { z } from 'zod';

const updateCollabSchema = z.object({
  filledSlots: z.number().int().min(0).optional(),
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

    let nextFilledSlots = post.collabFilledSlots ?? 0;
    if (typeof data.filledSlots === 'number') {
      if (post.collabTotalSlots !== null && data.filledSlots > post.collabTotalSlots) {
        return NextResponse.json({ error: 'Filled slots cannot exceed total slots' }, { status: 400 });
      }
      nextFilledSlots = data.filledSlots;
    }

    let nextIsClosed = post.collabIsClosed;
    if (typeof data.isClosed === 'boolean') {
      nextIsClosed = data.isClosed;
    } else if (post.collabTotalSlots !== null && nextFilledSlots === post.collabTotalSlots) {
      nextIsClosed = true;
    }

    let nextDeadline = post.collabDeadline;
    if (data.deadline !== undefined) {
      nextDeadline = data.deadline ? new Date(data.deadline) : null;
    }

    const wasClosed = post.collabIsClosed;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        collabFilledSlots: nextFilledSlots,
        collabIsClosed: nextIsClosed,
        collabDeadline: nextDeadline,
      },
      include: {
        ...POST_INCLUDE,
        savedBy: { where: { userId: session.user.id }, select: { userId: true } },
        comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
      },
    });

    if (!wasClosed && nextIsClosed) {
      createNotificationSafe({
        userId: session.user.id,
        type: 'COLLAB_SLOT_FILLED',
        title: 'Team Full',
        body: `Your collaboration post "${post.title}" is now marked as complete.`,
        linkUrl: `/post/${post.id}`,
        refId: post.id,
      });
    }

    return NextResponse.json(serializePost(updated as PostForSerialization, session.user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
