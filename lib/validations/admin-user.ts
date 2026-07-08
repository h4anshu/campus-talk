import { z } from 'zod';

export const warnUserSchema = z.object({
  message: z.string().trim().min(1, 'Warning message is required').max(500),
});
export type WarnUserInput = z.infer<typeof warnUserSchema>;

export const banUserSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required').max(500),
});
export type BanUserInput = z.infer<typeof banUserSchema>;

export const deleteUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
  blockEmail: z.boolean().optional().default(false),
});
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
