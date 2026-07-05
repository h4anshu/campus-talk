import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export interface StatsData {
  students: number;
  online: number;
  posts: number;
  answers: number;
}

export function useCollegeStats() {
  return useQuery<StatsData>({
    queryKey: ['collegeStats'],
    queryFn: () => fetchJson<StatsData>('/api/college/stats'),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}
