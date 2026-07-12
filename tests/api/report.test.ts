import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/posts/[id]/report/route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

describe('POST /api/posts/[id]/report', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    (vi.mocked(auth) as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/posts/test-id/report', {
      method: 'POST',
      body: JSON.stringify({ reason: 'SPAM' }),
    });
    const res = await POST(req, { params: { id: 'test-id' } });
    expect(res.status).toBe(401);
  });

  it('returns 409 on duplicate report (m1 fix)', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1', collegeId: 'college-1' } } as any);
    vi.mocked(prisma.post.findUnique).mockResolvedValue({ id: 'post-1', status: 'APPROVED' } as any);
    vi.mocked(prisma.report.findUnique).mockResolvedValue({ id: 'existing-report' } as any);
    const req = new NextRequest('http://localhost/api/posts/post-1/report', {
      method: 'POST',
      body: JSON.stringify({ reason: 'SPAM' }),
    });
    const res = await POST(req, { params: { id: 'post-1' } });
    expect(res.status).toBe(409);
  });
});
