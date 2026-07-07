import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

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
    queryFn: () => fetch('/api/notifications').then((r) => r.json()),
    refetchInterval: 30_000, // poll every 30s
    staleTime: 15_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetch('/api/notifications/read', { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications'] });
      qc.setQueryData<AppNotification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? []
      );
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
