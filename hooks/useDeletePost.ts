'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

type PostDetailCache = { post: MockPost; comments: MockComment[] } | undefined;

export function useDeletePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => fetchJson(`/api/posts/${postId}`, { method: 'DELETE' }),
    onSuccess: () => {
      // Remove immediately from every cached list rather than just
      // invalidating — a deleted post shouldn't flash back in on refetch.
      queryClient.setQueriesData<MockPost[]>({ queryKey: ['posts'] }, (old) =>
        old?.filter((p) => p.id !== postId)
      );
      queryClient.removeQueries({ queryKey: postQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
