import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson, hydratePost } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

type PostDetailCache = { post: MockPost; comments: MockComment[] } | undefined;

// The slot count is now a server-applied delta, not a client-computed
// absolute value — the server increments/decrements atomically, so two
// concurrent "+1"s can no longer read the same starting count and clobber
// each other. isClosed/deadline stay a separate, direct-set action.
type CollabUpdateInput = { action: 'increment' | 'decrement' } | { isClosed?: boolean; deadline?: string };

export function useCollabUpdate(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CollabUpdateInput) =>
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
