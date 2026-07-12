import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrThrow, handleApiError, ApiError } from '@/lib/api-helpers';
import { submitReportSchema } from '@/lib/validations/report';
import { strictLimiter, getClientIp, applyRateLimit } from '@/lib/ratelimit';

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = await applyRateLimit(strictLimiter, getClientIp(req));
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionOrThrow();
    const data = submitReportSchema.parse(await req.json());

    const post = await prisma.post.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!post) throw new ApiError('Post not found', 404);

    const existing = await prisma.report.findUnique({
      where: { postId_reporterId: { postId: params.id, reporterId: session.user.id } },
    });
    if (existing) throw new ApiError('You have already reported this post', 409);

    try {
      await prisma.report.create({
        data: {
          postId: params.id,
          reporterId: session.user.id,
          reason: data.reason,
          otherText: data.reason === 'OTHER' ? data.otherText : null,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Same message as the existing.findUnique check above — the
        // client's onError already matches on this exact text for the
        // "already reported" toast.
        throw new ApiError('You have already reported this post', 409);
      }
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
