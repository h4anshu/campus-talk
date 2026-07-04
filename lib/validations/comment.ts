import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty').max(5000),
  postId: z.string().min(1, 'postId is required'),
  parentId: z.string().min(1).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
