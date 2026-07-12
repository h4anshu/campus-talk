import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string; // recipient
  type: NotificationType;
  title: string;
  body: string;
  linkUrl?: string;
  actorName?: string;
  actorImage?: string;
  /** The user who triggered this notification, if any (system/admin-generated
   *  notifications have no actor). Pass it whenever the caller has one, so
   *  the self-notify guard below actually has something to compare. */
  actorId?: string;
  refId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  // Never notify yourself — enforced here, not left to each call site.
  if (input.actorId && input.actorId === input.userId) return null;
  // actorId isn't a Notification column (only actorName/actorImage are) —
  // it exists solely for the guard above, so strip it before the write.
  const { actorId: _actorId, ...data } = input;
  return prisma.notification.create({ data });
}

export async function createNotificationSafe(input: CreateNotificationInput) {
  return createNotification(input).catch((err) =>
    console.error('[notification] failed to create:', err)
  );
}
