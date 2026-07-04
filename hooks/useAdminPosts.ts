'use client';

import { useMutation } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import { fetchJson, hydratePost } from '@/lib/api-client';
import type { CreateAdminPostInput } from '@/lib/validations/admin-post';

export function useCreateAdminPost() {
  return useMutation({
    mutationFn: async (input: CreateAdminPostInput) => {
      const data = await fetchJson<{ post: MockPost }>('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return hydratePost(data.post);
    },
  });
}
