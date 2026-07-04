'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

type VoteResult = { voteCount: number; userVote: 'up' | 'down' | null };
type Votable = { voteCount: number; userVote?: 'up' | 'down' | null };
type PostDetailCache = { post: MockPost; comments: MockComment[] } | undefined;

function applyVoteOptimistically<T extends Votable>(current: T, direction: 'up' | 'down'): T {
  const prevVote = current.userVote ?? null;
  let voteCount = current.voteCount;
  let userVote: 'up' | 'down' | null;

  if (prevVote === direction) {
    voteCount += direction === 'up' ? -1 : 1;
    userVote = null;
  } else if (prevVote === null) {
    voteCount += direction === 'up' ? 1 : -1;
    userVote = direction;
  } else {
    voteCount += direction === 'up' ? 2 : -2;
    userVote = direction;
  }

  return { ...current, voteCount, userVote };
}

function updateCommentInTree(
  comments: MockComment[],
  commentId: string,
  direction: 'up' | 'down'
): MockComment[] {
  return comments.map((c) => {
    if (c.id === commentId) return applyVoteOptimistically(c, direction);
    if (c.replies.length > 0) {
      return { ...c, replies: updateCommentInTree(c.replies, commentId, direction) };
    }
    return c;
  });
}

/** Vote on a post. Optimistically patches every cached posts-list and the post detail query. */
export function useVote(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (direction: 'up' | 'down') =>
      fetchJson<VoteResult>(`/api/posts/${postId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type: direction }),
      }),
    onMutate: async (direction) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: postQueryKey(postId) });

      const previousLists = queryClient.getQueriesData<MockPost[]>({ queryKey: ['posts'] });
      const previousDetail = queryClient.getQueryData<PostDetailCache>(postQueryKey(postId));

      queryClient.setQueriesData<MockPost[]>({ queryKey: ['posts'] }, (old) =>
        old?.map((p) => (p.id === postId ? applyVoteOptimistically(p, direction) : p))
      );

      queryClient.setQueryData<PostDetailCache>(postQueryKey(postId), (old) =>
        old ? { ...old, post: applyVoteOptimistically(old.post, direction) } : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_err, _direction, context) => {
      context?.previousLists?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) queryClient.setQueryData(postQueryKey(postId), context.previousDetail);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });
}

/** Vote on a comment/answer nested inside a post's comment tree. */
export function useCommentVote(postId: string, commentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (direction: 'up' | 'down') =>
      fetchJson<VoteResult>(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ type: direction }),
      }),
    onMutate: async (direction) => {
      await queryClient.cancelQueries({ queryKey: postQueryKey(postId) });
      const previousDetail = queryClient.getQueryData<PostDetailCache>(postQueryKey(postId));

      queryClient.setQueryData<PostDetailCache>(postQueryKey(postId), (old) =>
        old ? { ...old, comments: updateCommentInTree(old.comments, commentId, direction) } : old
      );

      return { previousDetail };
    },
    onError: (_err, _direction, context) => {
      if (context?.previousDetail) queryClient.setQueryData(postQueryKey(postId), context.previousDetail);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });
}
