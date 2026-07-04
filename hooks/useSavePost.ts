'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

type SaveResult = { isSaved: boolean };
type PostDetailCache = { post: MockPost; comments: MockComment[] } | undefined;

export function useSavePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      fetchJson<SaveResult>(`/api/posts/${postId}/save`, { method: 'POST' }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: postQueryKey(postId) });

      const previousLists = queryClient.getQueriesData<MockPost[]>({ queryKey: ['posts'] });
      const previousDetail = queryClient.getQueryData<PostDetailCache>(postQueryKey(postId));

      queryClient.setQueriesData<MockPost[]>({ queryKey: ['posts'] }, (old) =>
        old?.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
      );
      queryClient.setQueryData<PostDetailCache>(postQueryKey(postId), (old) =>
        old ? { ...old, post: { ...old.post, isSaved: !old.post.isSaved } } : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_err, _vars, context) => {
      context?.previousLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) queryClient.setQueryData(postQueryKey(postId), context.previousDetail);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });
}
