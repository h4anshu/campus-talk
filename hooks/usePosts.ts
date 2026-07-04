'use client';

import { useQuery } from '@tanstack/react-query';
import type { MockPost } from '@/lib/mock/posts';
import { fetchJson, hydratePost } from '@/lib/api-client';

export interface PostFilters {
  topic?: string;
  space?: string;
  sort?: string;
  saved?: boolean;
}

export function postsQueryKey(filters: PostFilters = {}) {
  return ['posts', filters] as const;
}

export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: postsQueryKey(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.topic) params.set('topic', filters.topic);
      if (filters.space) params.set('space', filters.space);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.saved) params.set('saved', 'true');

      const data = await fetchJson<{ posts: MockPost[] }>(`/api/posts?${params.toString()}`);
      return data.posts.map(hydratePost);
    },
  });
}
