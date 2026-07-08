import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, ReportReason, ReportStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';

const PAGE_SIZE = 15;

function mostCommonReason(reasons: ReportReason[]): ReportReason {
  const counts = new Map<ReportReason, number>();
  for (const r of reasons) counts.set(r, (counts.get(r) ?? 0) + 1);
  let top: ReportReason = reasons[0];
  let topCount = 0;
  for (const [reason, count] of counts) {
    if (count > topCount) {
      top = reason;
      topCount = count;
    }
  }
  return top;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    const sort = searchParams.get('sort') ?? 'most_reported';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const where: Prisma.ReportWhereInput = {};
    if (status && ['PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN'].includes(status)) {
      where.status = status as ReportStatus;
    }
    if (
      reason &&
      ['SPAM', 'MISINFORMATION', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'HATE_SPEECH', 'PLAGIARISM', 'WRONG_CATEGORY', 'OTHER'].includes(
        reason
      )
    ) {
      where.reason = reason as ReportReason;
    }

    const allReports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            body: true,
            space: true,
            topic: true,
            createdAt: true,
            status: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                dept: true,
                year: true,
                warningCount: true,
                status: true,
              },
            },
          },
        },
        reporter: {
          select: { id: true, name: true, dept: true, year: true },
        },
      },
    });

    const byPost = new Map<string, typeof allReports>();
    for (const report of allReports) {
      const list = byPost.get(report.postId) ?? [];
      list.push(report);
      byPost.set(report.postId, list);
    }

    let grouped = Array.from(byPost.values()).map((reports) => {
      const first = reports[0];
      const post = first.post;
      const sortedByDate = [...reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const latest = sortedByDate[0];

      return {
        postId: post.id,
        postTitle: post.title,
        postBody: post.body.slice(0, 200),
        postSpace: post.space,
        postTopic: post.topic,
        postCreatedAt: post.createdAt.toISOString(),
        postStatus: post.status,
        author: {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
          dept: post.author.dept,
          year: post.author.year,
          warningCount: post.author.warningCount,
          status: post.author.status,
        },
        reportCount: reports.length,
        topReason: mostCommonReason(reports.map((r) => r.reason)),
        status: latest.status,
        latestReportAt: latest.createdAt.toISOString(),
        reporters: sortedByDate.slice(0, 10).map((r) => ({
          id: r.reporter.id,
          name: r.reporter.name,
          dept: r.reporter.dept,
          year: r.reporter.year,
          reason: r.reason,
          otherText: r.otherText,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    });

    if (sort === 'newest') {
      grouped.sort((a, b) => new Date(b.latestReportAt).getTime() - new Date(a.latestReportAt).getTime());
    } else if (sort === 'oldest') {
      grouped.sort((a, b) => new Date(a.latestReportAt).getTime() - new Date(b.latestReportAt).getTime());
    } else {
      grouped.sort((a, b) => b.reportCount - a.reportCount);
    }

    const total = grouped.length;
    const paged = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const statsRaw = await prisma.report.groupBy({ by: ['status'], _count: { status: true } });
    const stats = {
      total: statsRaw.reduce((sum, s) => sum + s._count.status, 0),
      pending: statsRaw.find((s) => s.status === 'PENDING')?._count.status ?? 0,
      actionTaken: statsRaw.find((s) => s.status === 'ACTION_TAKEN')?._count.status ?? 0,
      dismissed: statsRaw.find((s) => s.status === 'DISMISSED')?._count.status ?? 0,
    };

    return NextResponse.json({ reports: paged, total, stats });
  } catch (error) {
    return handleApiError(error);
  }
}
