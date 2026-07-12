'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export type ModerateAction = 'PIN' | 'UNPIN' | 'LOCK' | 'UNLOCK' | 'REMOVE';

interface ModerateResult {
  id: string;
  pinned: boolean;
  locked: boolean;
  status: string;
}

export function useModeratePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, action }: { postId: string; action: ModerateAction }) =>
      fetchJson<ModerateResult>(`/api/admin/posts/${postId}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
