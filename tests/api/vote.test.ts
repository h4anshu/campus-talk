import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/posts/[id]/vote/route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

describe('POST /api/posts/[id]/vote', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    (vi.mocked(auth) as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/posts/test-id/vote', {
      method: 'POST',
      body: JSON.stringify({ type: 'up' }),
    });
    const res = await POST(req, { params: { id: 'test-id' } });
    expect(res.status).toBe(401);
  });

  it('returns 404 when post does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1', collegeId: 'college-1' } } as any);
    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/posts/nonexistent/vote', {
      method: 'POST',
      body: JSON.stringify({ type: 'up' }),
    });
    const res = await POST(req, { params: { id: 'nonexistent' } });
    expect(res.status).toBe(404);
  });
});
