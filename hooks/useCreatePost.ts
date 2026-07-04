'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import { fetchJson, hydratePost } from '@/lib/api-client';
import type { CreatePostInput } from '@/lib/validations/post';

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const data = await fetchJson<{ post: MockPost }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return hydratePost(data.post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
