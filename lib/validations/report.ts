import { z } from 'zod';

const reportReasonValues = [
  'SPAM',
  'MISINFORMATION',
  'HARASSMENT',
  'INAPPROPRIATE_CONTENT',
  'HATE_SPEECH',
  'PLAGIARISM',
  'WRONG_CATEGORY',
  'OTHER',
] as const;

export const submitReportSchema = z
  .object({
    reason: z.enum(reportReasonValues),
    otherText: z.string().trim().max(200).optional(),
  })
  .refine((data) => (data.reason === 'OTHER' ? !!data.otherText?.trim() : true), {
    message: 'Please describe your reason',
    path: ['otherText'],
  });
export type SubmitReportInput = z.infer<typeof submitReportSchema>;

export const reportActionSchema = z
  .object({
    action: z.enum(['REMOVE_POST', 'WARN_AUTHOR', 'BAN_AUTHOR', 'MARK_REVIEWED', 'DISMISS']),
    warningMessage: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => (data.action === 'WARN_AUTHOR' || data.action === 'BAN_AUTHOR' ? !!data.warningMessage?.trim() : true),
    { message: 'A message is required for this action', path: ['warningMessage'] }
  );
export type ReportActionInput = z.infer<typeof reportActionSchema>;
