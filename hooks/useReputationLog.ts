'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';
import type { ReputationReason } from '@/lib/reputation';

export interface ReputationLogEntry {
  id: string;
  points: number;
  reason: ReputationReason;
  refId: string | null;
  createdAt: string;
}

/** Fetches the signed-in user's own reputation log. `enabled` should be tied
 *  to the Reputation tab actually being open, so this doesn't fire on every
 *  profile page load. */
export function useReputationLog(enabled: boolean) {
  return useQuery({
    queryKey: ['reputationLog'],
    queryFn: async () => {
      const data = await fetchJson<{ logs: ReputationLogEntry[] }>('/api/user/reputation-log');
      return data.logs;
    },
    enabled,
  });
}
