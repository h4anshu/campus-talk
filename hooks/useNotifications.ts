import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { fetchJson } from '@/lib/api-client';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  linkUrl: string | null;
  actorName: string | null;
  actorImage: string | null;
  createdAt: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => fetchJson<AppNotification[]>('/api/notifications'),
    refetchInterval: 30_000, // poll every 30s
    staleTime: 15_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetchJson('/api/notifications/read', { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const previous = qc.getQueryData<AppNotification[]>(['notifications']);
      qc.setQueryData<AppNotification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(['notifications'], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useNotificationRealtime(userId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    let channel: any = null;
    let localClient = supabase;

    const setup = async () => {
      if (!localClient) {
        try {
          const config = await fetch('/api/notifications/config').then((r) => r.json());
          if (config.url && config.anonKey) {
            localClient = createClient(config.url, config.anonKey);
          }
        } catch (e) {
          console.error('[realtime] failed to fetch config:', e);
        }
      }

      if (!localClient) return;

      channel = localClient
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notification',
            filter: `userId=eq.${userId}`,
          },
          () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel && localClient) {
        localClient.removeChannel(channel);
      }
    };
  }, [userId, qc]);
}
