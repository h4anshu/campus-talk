import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { fetchJson } from '@/lib/api-client';

const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () =>
      fetchJson<{ notifications: any[]; unreadCount: number }>('/api/notifications'),
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchJson('/api/notifications', { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });
}

export function useNotificationsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    let supabaseClient: any = null;
    let channel: any = null;

    const setupRealtime = async () => {
      try {
        const config = await fetchJson<{ url: string; anonKey: string }>(
          '/api/notifications/config'
        );
        if (!config.url || !config.anonKey) return;

        supabaseClient = createClient(config.url, config.anonKey);

        channel = supabaseClient
          .channel('db-notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'Notification',
              filter: `userId=eq.${userId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
            }
          )
          .subscribe();
      } catch (err) {
        console.error('Failed to setup Supabase Realtime:', err);
      }
    };

    setupRealtime();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [userId, queryClient]);
}
