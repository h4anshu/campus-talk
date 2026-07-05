import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';
import { SPACES } from '@/lib/constants';

export function useSpacesUnread() {
  return useQuery<Record<string, number>>({
    queryKey: ['spacesUnread'],
    queryFn: async () => {
      const params = new URLSearchParams();
      SPACES.forEach((space) => {
        const key = `space_visited_${space.key}`;
        const val = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
        const date = val ? new Date(val) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        params.append(space.key, date.toISOString());
      });

      return fetchJson<Record<string, number>>(`/api/spaces/unread?${params.toString()}`);
    },
    refetchInterval: 15 * 1000, // Refresh every 15 seconds
  });
}
