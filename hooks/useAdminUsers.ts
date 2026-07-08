'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  year: number | null;
  dept: string | null;
  status: 'ACTIVE' | 'WARNED' | 'BANNED';
  warningCount: number;
  bannedAt: string | null;
  reputation: number;
  createdAt: string;
  updatedAt: string;
  _count: { posts: number; comments: number };
}

export interface AdminUserStats {
  total: number;
  active: number;
  warned: number;
  banned: number;
}

interface AdminUsersFilters {
  search?: string;
  status?: string;
  year?: string;
  dept?: string;
  sort?: string;
  page?: number;
}

interface AdminUsersResponse {
  users: AdminUserRow[];
  total: number;
  stats: AdminUserStats;
}

function adminUsersKey(filters: AdminUsersFilters) {
  return ['admin', 'users', filters] as const;
}

function buildQuery(filters: AdminUsersFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.year) params.set('year', filters.year);
  if (filters.dept) params.set('dept', filters.dept);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAdminUsers(filters: AdminUsersFilters) {
  return useQuery({
    queryKey: adminUsersKey(filters),
    queryFn: () => fetchJson<AdminUsersResponse>(`/api/admin/users${buildQuery(filters)}`),
  });
}

export function useWarnUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      fetchJson(`/api/admin/users/${id}/warn`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fetchJson(`/api/admin/users/${id}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/admin/users/${id}/unban`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, blockEmail }: { id: string; reason?: string; blockEmail?: boolean }) =>
      fetchJson(`/api/admin/users/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason, blockEmail }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
