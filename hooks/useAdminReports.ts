'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchJson } from '@/lib/api-client';

export type ReportReason =
  | 'SPAM'
  | 'MISINFORMATION'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'HATE_SPEECH'
  | 'PLAGIARISM'
  | 'WRONG_CATEGORY'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

export interface ReportedPostRow {
  postId: string;
  postTitle: string;
  postBody: string;
  postSpace: string | null;
  postTopic: string | null;
  postCreatedAt: string;
  postStatus: string;
  author: {
    id: string;
    name: string;
    email: string;
    dept: string | null;
    year: number | null;
    warningCount: number;
    status: string;
  };
  reportCount: number;
  topReason: ReportReason;
  status: ReportStatus;
  latestReportAt: string;
  reporters: Array<{
    id: string;
    name: string;
    dept: string | null;
    year: number | null;
    reason: ReportReason;
    otherText: string | null;
    createdAt: string;
  }>;
}

export interface AdminReportStats {
  total: number;
  pending: number;
  actionTaken: number;
  dismissed: number;
}

interface AdminReportsFilters {
  status?: string;
  reason?: string;
  sort?: string;
  page?: number;
}

interface AdminReportsResponse {
  reports: ReportedPostRow[];
  total: number;
  stats: AdminReportStats;
}

function buildQuery(filters: AdminReportsFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.reason) params.set('reason', filters.reason);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAdminReports(filters: AdminReportsFilters) {
  return useQuery({
    queryKey: ['admin-reports', filters],
    queryFn: () => fetchJson<AdminReportsResponse>(`/api/admin/reports${buildQuery(filters)}`),
  });
}

export type ReportActionType = 'REMOVE_POST' | 'WARN_AUTHOR' | 'BAN_AUTHOR' | 'MARK_REVIEWED' | 'DISMISS';

export function useReportAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      action,
      warningMessage,
    }: {
      postId: string;
      action: ReportActionType;
      warningMessage?: string;
    }) =>
      fetchJson(`/api/admin/reports/${postId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, warningMessage }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
}
