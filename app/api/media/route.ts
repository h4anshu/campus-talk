import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { isAdminSession, getOrCreateAdminOfficeUser } from '@/lib/admin-auth';

const createMediaSchema = z.object({
  postId: z.string().min(1),
  url: z.string().url(),
  providerId: z.string().optional(),
  type: z.enum(['image', 'video', 'youtube', 'drive']).default('image'),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdminSession();
    const data = createMediaSchema.parse(await req.json());

    const post = await prisma.post.findUnique({ where: { id: data.postId }, select: { authorId: true } });
    if (!post) throw new ApiError('Post not found', 404);

    if (admin) {
      const adminOffice = await getOrCreateAdminOfficeUser();
      if (post.authorId !== adminOffice.id) {
        throw new ApiError('You can only attach media to your own posts', 403);
      }
    } else {
      const session = await getSessionOrThrow();
      if (post.authorId !== session.user.id) {
        throw new ApiError('You can only attach media to your own posts', 403);
      }
    }

    const media = await prisma.media.create({
      data: {
        postId: data.postId,
        url: data.url,
        providerId: data.providerId,
        type: data.type,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
