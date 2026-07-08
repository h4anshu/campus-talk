'use client';

import { useMutation } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';
import type { SubmitReportInput } from '@/lib/validations/report';

export function useSubmitReport(postId: string) {
  return useMutation({
    mutationFn: (input: SubmitReportInput) =>
      fetchJson(`/api/posts/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}
