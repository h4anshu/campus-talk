import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export function useCollabUpdate(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { filledSlots?: number; isClosed?: boolean; deadline?: string }) =>
      fetchJson(`/api/posts/${postId}/collab`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: (updated) => {
      // Optimistically update both the post detail cache and posts list cache
      queryClient.setQueryData(['post', postId], updated);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
