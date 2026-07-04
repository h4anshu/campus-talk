import { z } from 'zod';

export const createAdminPostSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().trim().min(1, 'Post body is required').max(20000),
  space: z.enum(['announcements', 'events']),
  priority: z.enum(['Critical', 'Info', 'General']).optional(),
  pinned: z.boolean().optional().default(false),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
});
export type CreateAdminPostInput = z.infer<typeof createAdminPostSchema>;
