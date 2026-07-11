'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MockTicket, MockTicketMessage } from '@/lib/mock/tickets';
import { fetchJson } from '@/lib/api-client';
import type { CreateTicketInput } from '@/lib/validations/ticket';

const TICKETS_KEY = ['tickets'] as const;

function hydrateTicket(ticket: MockTicket): MockTicket {
  return {
    ...ticket,
    createdAt: new Date(ticket.createdAt),
    messages: ticket.messages.map((m) => ({ ...m, createdAt: new Date(m.createdAt) })),
  };
}

/**
 * Server scopes this to the caller's own tickets, or every ticket if the
 * caller is admin. Polls every 15s so both sides notice new messages without
 * Supabase Realtime (that's a later phase) — cheap enough at this scale.
 */
export function useTickets() {
  return useQuery({
    queryKey: TICKETS_KEY,
    queryFn: async () => {
      const data = await fetchJson<{ tickets: MockTicket[] }>('/api/tickets');
      return data.tickets.map(hydrateTicket);
    },
    refetchInterval: 15_000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTicketInput) => {
      const data = await fetchJson<{ ticket: MockTicket }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return hydrateTicket(data.ticket);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}

export function useReplyTicket(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const data = await fetchJson<{ message: MockTicketMessage }>(`/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return data.message;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}

export function useMarkTicketRead(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchJson(`/api/tickets/${ticketId}/read`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}

export function useTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') =>
      fetchJson(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TICKETS_KEY }),
  });
}
