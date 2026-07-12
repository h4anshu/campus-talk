import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/tickets/[id]/reply/route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isAdminSession } from '@/lib/admin-auth';

// The task's original version of this file constructed a Request and never
// actually called POST() with it — it asserted on the URL string alone,
// which proves nothing about the route's behavior. Rewritten below to
// actually invoke the handler and assert on its real output.
describe('POST /api/tickets/[id]/reply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('saves as ADMIN when ?as=admin is passed, even with a student session present (C1 fix)', async () => {
    // Dual-session scenario: the admin cookie is valid AND a NextAuth
    // student session exists in the same browser — the exact case that
    // used to silently misattribute the reply to the student.
    vi.mocked(isAdminSession).mockResolvedValue(true);
    vi.mocked(auth).mockResolvedValue({ user: { id: 'student-1', name: 'Student One' } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue({
      id: 'ticket-1',
      userId: 'student-1',
      subject: 'Test ticket',
    } as any);
    vi.mocked(prisma.ticketMessage.create).mockResolvedValue({
      id: 'msg-1',
      content: 'test admin reply',
      senderRole: 'ADMIN',
      senderName: 'Admin',
      senderId: 'admin',
      ticketId: 'ticket-1',
      isRead: false,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest('http://localhost/api/tickets/ticket-1/reply?as=admin', {
      method: 'POST',
      body: JSON.stringify({ content: 'test admin reply' }),
    });
    const res = await POST(req, { params: { id: 'ticket-1' } });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message.senderRole).toBe('ADMIN');
    expect(vi.mocked(prisma.ticketMessage.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ senderRole: 'ADMIN', senderId: 'admin' }),
      })
    );
  });

  it('saves as USER when ?as=admin is absent, even with the admin cookie present (no regression)', async () => {
    vi.mocked(isAdminSession).mockResolvedValue(true);
    vi.mocked(auth).mockResolvedValue({ user: { id: 'student-1', name: 'Student One' } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue({
      id: 'ticket-1',
      userId: 'student-1',
      subject: 'Test ticket',
    } as any);
    vi.mocked(prisma.ticketMessage.create).mockResolvedValue({
      id: 'msg-2',
      content: 'test student reply',
      senderRole: 'USER',
      senderName: 'Student One',
      senderId: 'student-1',
      ticketId: 'ticket-1',
      isRead: false,
      createdAt: new Date(),
    } as any);

    const req = new NextRequest('http://localhost/api/tickets/ticket-1/reply', {
      method: 'POST',
      body: JSON.stringify({ content: 'test student reply' }),
    });
    const res = await POST(req, { params: { id: 'ticket-1' } });
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message.senderRole).toBe('USER');
  });

  it('returns 403 when neither the admin cookie nor ticket ownership applies', async () => {
    vi.mocked(isAdminSession).mockResolvedValue(false);
    vi.mocked(auth).mockResolvedValue({ user: { id: 'someone-else', name: 'Someone Else' } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue({
      id: 'ticket-1',
      userId: 'student-1',
      subject: 'Test ticket',
    } as any);

    const req = new NextRequest('http://localhost/api/tickets/ticket-1/reply', {
      method: 'POST',
      body: JSON.stringify({ content: 'not my ticket' }),
    });
    const res = await POST(req, { params: { id: 'ticket-1' } });
    expect(res.status).toBe(403);
  });
});
