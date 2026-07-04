'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import { fetchJson, hydratePost } from '@/lib/api-client';

const PENDING_KEY = ['admin', 'pending'] as const;

export function usePendingPosts() {
  return useQuery({
    queryKey: PENDING_KEY,
    queryFn: async () => {
      const data = await fetchJson<{ posts: MockPost[] }>('/api/admin/pending');
      return data.posts.map(hydratePost);
    },
  });
}

export function useApprovePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      fetchJson(`/api/admin/posts/${postId}/approve`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_KEY });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useRejectPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason?: string }) =>
      fetchJson(`/api/admin/posts/${postId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_KEY });
    },
  });
}
