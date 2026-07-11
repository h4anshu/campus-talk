import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson, hydratePost } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

type PostDetailCache = { post: MockPost; comments: MockComment[] } | undefined;

export function useCollabUpdate(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { filledSlots?: number; isClosed?: boolean; deadline?: string }) =>
      fetchJson<MockPost>(`/api/posts/${postId}/collab`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (updated) => {
      // The PATCH route returns a bare serialized post, not the cache's
      // actual { post, comments } envelope — writing it directly used to
      // clobber the cache and drop `.comments`, plus leave `.createdAt` as
      // an unhydrated ISO string. Merge into the envelope instead, same
      // pattern useVote/useSavePost already use for this same cache key.
      queryClient.setQueryData<PostDetailCache>(postQueryKey(postId), (old) =>
        old ? { ...old, post: hydratePost(updated) } : old
      );
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
