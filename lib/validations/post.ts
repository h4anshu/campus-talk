import { z } from 'zod';
import { TOPIC_KEYS, SPACE_KEYS } from '@/lib/constants';

const topicKeyTuple = TOPIC_KEYS as [string, ...string[]];
const spaceKeyTuple = SPACE_KEYS as [string, ...string[]];

export const createPostSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
    body: z.string().trim().min(1, 'Post body is required').max(20000),
    type: z.enum(['DISCUSSION', 'SPACE']),
    topic: z.enum(topicKeyTuple).optional(),
    space: z.enum(spaceKeyTuple).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
    anonymous: z.boolean().optional().default(false),
    collabTotalSlots: z.number().int().min(1).max(100).optional().nullable(),
    collabSkills: z.array(z.string()).max(8).optional(),
    collabProjectType: z.string().optional().nullable(),
    collabDeadline: z.string().optional().nullable(),
    collabContact: z.string().optional().nullable(),
  })
  .refine((data) => (data.type === 'DISCUSSION' ? !!data.topic : true), {
    message: 'A discussion post needs a topic',
    path: ['topic'],
  })
  .refine((data) => (data.type === 'SPACE' ? !!data.space : true), {
    message: 'A space post needs a space',
    path: ['space'],
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200).optional(),
  body: z.string().trim().min(1, 'Post body is required').max(20000).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).optional(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
