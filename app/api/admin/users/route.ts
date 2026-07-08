import { NextRequest, NextResponse } from 'next/server';
import type { Prisma, UserStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-helpers';
import { requireAdmin } from '@/lib/admin-auth';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const dept = searchParams.get('dept');
    const sort = searchParams.get('sort') ?? 'newest';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status && ['ACTIVE', 'WARNED', 'BANNED'].includes(status)) {
      where.status = status as UserStatus;
    }
    if (year) {
      where.year = Number(year);
    }
    if (dept) {
      where.dept = dept;
    }

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'az'
          ? { name: 'asc' }
          : sort === 'most_posts'
            ? { posts: { _count: 'desc' } }
            : { createdAt: 'desc' };

    const [users, total, statsRaw] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          year: true,
          dept: true,
          status: true,
          warningCount: true,
          bannedAt: true,
          reputation: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { posts: true, comments: true } },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const stats = {
      total: statsRaw.reduce((sum, s) => sum + s._count.status, 0),
      active: statsRaw.find((s) => s.status === 'ACTIVE')?._count.status ?? 0,
      warned: statsRaw.find((s) => s.status === 'WARNED')?._count.status ?? 0,
      banned: statsRaw.find((s) => s.status === 'BANNED')?._count.status ?? 0,
    };

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        year: u.year,
        dept: u.dept,
        status: u.status,
        warningCount: u.warningCount,
        bannedAt: u.bannedAt,
        reputation: u.reputation,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        _count: u._count,
      })),
      total,
      stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
