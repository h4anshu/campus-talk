import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession, getOrCreateAdminOfficeUser } from '@/lib/admin-auth';

const createMediaSchema = z.object({
  postId: z.string().min(1),
  url: z.string().url(),
  providerId: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  type: z.enum(['image', 'video', 'youtube', 'drive']).default('image'),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdminSession();
    const data = createMediaSchema.parse(await req.json());

    const post = await prisma.post.findUnique({ where: { id: data.postId }, select: { authorId: true } });
    if (!post) throw new ApiError('Post not found', 404);

    let authorized = false;

    // Check if they own it as a regular student
    const session = await getSessionOrThrow().catch(() => null);
    if (session && post.authorId === session.user.id) {
      authorized = true;
    }

    // Check if they own it as the Admin Office
    if (!authorized && admin) {
      const adminOffice = await getOrCreateAdminOfficeUser();
      if (post.authorId === adminOffice.id) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw new ApiError('You can only attach media to your own posts', 403);
    }

    const media = await prisma.media.create({
      data: {
        postId: data.postId,
        url: data.url,
        providerId: data.providerId,
        thumbnailUrl: data.thumbnailUrl,
        type: data.type,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
