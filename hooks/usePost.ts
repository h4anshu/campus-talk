'use client';

import { useQuery } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson, hydratePost, hydrateCommentTree } from '@/lib/api-client';

export function postQueryKey(id: string) {
  return ['post', id] as const;
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postQueryKey(id),
    queryFn: async () => {
      const data = await fetchJson<{ post: MockPost; comments: MockComment[] }>(`/api/posts/${id}`);
      return {
        post: hydratePost(data.post),
        comments: hydrateCommentTree(data.comments),
      };
    },
    enabled: !!id,
    retry: false,
  });
}
