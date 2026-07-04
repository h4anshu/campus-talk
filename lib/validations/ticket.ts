import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, 'Subject is required').max(150),
  body: z.string().trim().min(1, 'Please describe the issue').max(5000),
  type: z.enum(['POST_REQUEST', 'REPORT', 'QUERY']).default('QUERY'),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const replyTicketSchema = z.object({
  body: z.string().trim().min(1, 'Reply cannot be empty').max(5000),
});

export const ticketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
});
