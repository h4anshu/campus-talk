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
  refId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  // Never notify yourself
  return prisma.notification.create({ data: input });
}

export async function createNotificationSafe(input: CreateNotificationInput) {
  return createNotification(input).catch((err) =>
    console.error('[notification] failed to create:', err)
  );
}
