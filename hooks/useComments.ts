'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockComment } from '@/lib/mock/comments';
import { fetchJson } from '@/lib/api-client';
import { postQueryKey } from '@/hooks/usePost';

interface CreateCommentInput {
  postId: string;
  body: string;
  parentId?: string;
}

/** Creates a comment/reply, then refetches the post's comment tree. */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const data = await fetchJson<{ comment: MockComment }>('/api/comments', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data.comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useAcceptAnswer(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) =>
      fetchJson(`/api/comments/${commentId}/accept`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postQueryKey(postId) });
    },
  });
}
