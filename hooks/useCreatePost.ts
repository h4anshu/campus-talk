'use client';

import { useMutation } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import { fetchJson, hydratePost } from '@/lib/api-client';
import type { CreatePostInput } from '@/lib/validations/post';

export function useCreatePost() {
  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const data = await fetchJson<{ post: MockPost }>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return hydratePost(data.post);
    },
    // No onSuccess here — CreatePostDialog invalidates ['posts'] itself,
    // but only AFTER it has finished saving Media rows via POST /api/media.
    // Invalidating here would cause React Query to refetch the feed before
    // those rows exist, caching a response with an empty media array.
  });
}
