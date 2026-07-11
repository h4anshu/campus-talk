import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';
import { reportActionSchema } from '@/lib/validations/report';
import { createNotificationSafe } from '@/lib/createNotification';
import { updateReputation } from '@/lib/updateReputation';

interface RouteParams {
  params: { postId: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const data = reportActionSchema.parse(await req.json());

    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      select: { id: true, title: true, authorId: true },
    });
    if (!post) throw new ApiError('Post not found', 404);

    const reports = await prisma.report.findMany({
      where: { postId: params.postId },
      select: { id: true, reporterId: true },
    });
    if (reports.length === 0) throw new ApiError('No reports found for this post', 404);

    const reporterIds = reports.map((r) => r.reporterId);

    switch (data.action) {
      case 'REMOVE_POST': {
        // Gate on status: 'PENDING' so a retry/double-click/second-admin
        // after this report group is already resolved matches zero rows —
        // updateMany's row-level UPDATE serializes this correctly even
        // under concurrent requests, so only the first ever proceeds past
        // this point to award reputation or send notifications.
        const { count } = await prisma.$transaction(async (tx) => {
          const updateResult = await tx.report.updateMany({
            where: { postId: post.id, status: 'PENDING' },
            data: { status: 'ACTION_TAKEN', resolvedAt: new Date() },
          });
          if (updateResult.count === 0) return updateResult;

          await tx.post.update({ where: { id: post.id }, data: { status: 'REMOVED' } });
          await updateReputation(tx, post.authorId, 'POST_REMOVED_BY_REPORT', post.id);
          for (const reporterId of reporterIds) {
            await updateReputation(tx, reporterId, 'REPORT_VERIFIED', post.id);
          }
          return updateResult;
        });

        if (count === 0) {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        await createNotificationSafe({
          userId: post.authorId,
          type: 'POST_REMOVED_BY_ADMIN',
          title: 'Your post was removed',
          body: 'Your post was removed for violating community guidelines.',
        });
        for (const reporterId of reporterIds) {
          await createNotificationSafe({
            userId: reporterId,
            type: 'REPORT_ACTION_TAKEN',
            title: 'Report reviewed',
            body: 'The post you reported has been removed by admin.',
          });
        }
        break;
      }

      case 'WARN_AUTHOR': {
        if (!data.warningMessage?.trim()) throw new ApiError('Warning message is required', 400);

        const { count } = await prisma.$transaction(async (tx) => {
          const updateResult = await tx.report.updateMany({
            where: { postId: post.id, status: 'PENDING' },
            data: { status: 'ACTION_TAKEN', resolvedAt: new Date() },
          });
          if (updateResult.count === 0) return updateResult;

          await tx.user.update({
            where: { id: post.authorId },
            data: { warningCount: { increment: 1 }, status: 'WARNED' },
          });
          for (const reporterId of reporterIds) {
            await updateReputation(tx, reporterId, 'REPORT_VERIFIED', post.id);
          }
          return updateResult;
        });

        if (count === 0) {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        await createNotificationSafe({
          userId: post.authorId,
          type: 'ADMIN_WARNING',
          title: 'Warning from admin',
          body: data.warningMessage,
        });
        for (const reporterId of reporterIds) {
          await createNotificationSafe({
            userId: reporterId,
            type: 'REPORT_ACTION_TAKEN',
            title: 'Report reviewed',
            body: 'Action has been taken on the post you reported.',
          });
        }
        break;
      }

      case 'BAN_AUTHOR': {
        if (!data.warningMessage?.trim()) throw new ApiError('Ban reason is required', 400);

        const { count } = await prisma.$transaction(async (tx) => {
          const updateResult = await tx.report.updateMany({
            where: { postId: post.id, status: 'PENDING' },
            data: { status: 'ACTION_TAKEN', resolvedAt: new Date() },
          });
          if (updateResult.count === 0) return updateResult;

          await tx.user.update({
            where: { id: post.authorId },
            data: { status: 'BANNED', bannedAt: new Date(), bannedReason: data.warningMessage },
          });
          for (const reporterId of reporterIds) {
            await updateReputation(tx, reporterId, 'REPORT_VERIFIED', post.id);
          }
          return updateResult;
        });

        if (count === 0) {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        await prisma.session.deleteMany({ where: { userId: post.authorId } });

        await createNotificationSafe({
          userId: post.authorId,
          type: 'ADMIN_WARNING',
          title: 'Your account has been suspended',
          body: data.warningMessage,
        });
        for (const reporterId of reporterIds) {
          await createNotificationSafe({
            userId: reporterId,
            type: 'REPORT_ACTION_TAKEN',
            title: 'Report reviewed',
            body: 'Action has been taken on the post you reported.',
          });
        }
        break;
      }

      case 'MARK_REVIEWED': {
        const { count } = await prisma.report.updateMany({
          where: { postId: post.id, status: 'PENDING' },
          data: { status: 'REVIEWED', resolvedAt: new Date() },
        });

        if (count === 0) {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        for (const reporterId of reporterIds) {
          await createNotificationSafe({
            userId: reporterId,
            type: 'REPORT_ACTION_TAKEN',
            title: 'Report reviewed',
            body: 'Your report has been reviewed. No violation was found.',
          });
        }
        break;
      }

      case 'DISMISS': {
        const { count } = await prisma.$transaction(async (tx) => {
          const updateResult = await tx.report.updateMany({
            where: { postId: post.id, status: 'PENDING' },
            data: { status: 'DISMISSED', resolvedAt: new Date() },
          });
          if (updateResult.count === 0) return updateResult;

          for (const reporterId of reporterIds) {
            await updateReputation(tx, reporterId, 'REPORT_FALSE', post.id);
          }
          return updateResult;
        });

        if (count === 0) {
          return NextResponse.json({ success: true, alreadyResolved: true });
        }

        for (const reporterId of reporterIds) {
          await createNotificationSafe({
            userId: reporterId,
            type: 'REPORT_ACTION_TAKEN',
            title: 'Report reviewed',
            body: 'Your report has been reviewed. No violation was found.',
          });
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
