import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export interface SidebarData {
  trending: { id: string; title: string; score: number; commentCount: number; voteCount: number }[];
  upcomingEvents: {
    id: string;
    title: string;
    eventDate: string;
    eventLocation: string | null;
    eventVenue: string | null;
    daysUntil: number;
  }[];
  community: { students: number; posts: number; answers: number };
}

export function useSidebar() {
  return useQuery<SidebarData>({
    queryKey: ['sidebar'],
    queryFn: () => fetchJson<SidebarData>('/api/sidebar'),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
