'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, ShieldCheck, Pin, PinOff, Lock, LockOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import Avatar from '@/components/shared/Avatar';
import { getInitials, getAvatarColor, getYearSuffix } from '@/lib/utils';
import { enumToKey, SPACES, TOPICS } from '@/lib/constants';
import {
  useAdminReports,
  useReportAction,
  type ReportedPostRow,
  type ReportReason,
  type ReportStatus,
} from '@/hooks/useAdminReports';
import { useModeratePost } from '@/hooks/useModeratePost';
import WarnUserDialog from '@/components/admin/WarnUserDialog';
import BanUserDialog from '@/components/admin/BanUserDialog';

const PAGE_SIZE = 15;

const REASON_LABELS: Record<ReportReason, string> = {
  SPAM: 'Spam',
  MISINFORMATION: 'Misinformation',
  HARASSMENT: 'Harassment',
  INAPPROPRIATE_CONTENT: 'Inappropriate',
  HATE_SPEECH: 'Hate speech',
  PLAGIARISM: 'Plagiarism',
  WRONG_CATEGORY: 'Wrong category',
  OTHER: 'Other',
};

const STATUS_BADGE: Record<ReportStatus, string> = {
  PENDING: 'bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger-border)]',
  REVIEWED: 'bg-[var(--success-dim)] text-[var(--success)] border-[var(--success-border)]',
  DISMISSED: 'bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border)]',
  ACTION_TAKEN: 'bg-[var(--success-dim)] text-[var(--success)] border-[var(--success-border)]',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pending',
  REVIEWED: 'Reviewed',
  DISMISSED: 'Dismissed',
  ACTION_TAKEN: 'Action taken',
};

function sectionLabel(space: string | null, topic: string | null): string | null {
  if (space) return SPACES.find((s) => s.key === enumToKey(space))?.label ?? space;
  if (topic) return TOPICS.find((t) => t.key === enumToKey(topic))?.label ?? topic;
  return null;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-[20px] font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ReportCard({ report }: { report: ReportedPostRow }) {
  const [expanded, setExpanded] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(false);

  const { mutate: reportAction, isPending } = useReportAction();
  const { mutate: moderatePost, isPending: moderating } = useModeratePost();
  const section = sectionLabel(report.postSpace, report.postTopic);
  const isPending_ = report.status === 'PENDING';

  const runModerate = (action: 'PIN' | 'UNPIN' | 'LOCK' | 'UNLOCK') => {
    moderatePost(
      { postId: report.postId, action },
      {
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to update post'),
      }
    );
  };

  const runAction = (action: 'REMOVE_POST' | 'MARK_REVIEWED' | 'DISMISS') => {
    reportAction(
      { postId: report.postId, action },
      {
        onSuccess: () => toast.success('Action taken — reporters notified.'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to take action'),
      }
    );
  };

  const afterWarnOrBan = (action: 'WARN_AUTHOR' | 'BAN_AUTHOR') => {
    reportAction(
      { postId: report.postId, action },
      {
        onSuccess: () => toast.success('Action taken — reporters notified.'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to update report'),
      }
    );
  };

  return (
    <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className={`shrink-0 rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium ${
            isPending_
              ? 'border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)]'
              : 'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-muted)]'
          }`}
        >
          {report.reportCount} report{report.reportCount === 1 ? '' : 's'}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">
            {report.postTitle.slice(0, 80)}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span>by {report.author.name}</span>
            {section && (
              <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-1.5 py-0.5 text-[var(--text-secondary)]">
                {section}
              </span>
            )}
            <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-1.5 py-0.5 text-[var(--text-secondary)]">
              {REASON_LABELS[report.topReason]}
            </span>
            <span className={`rounded-full border-[0.5px] px-1.5 py-0.5 font-medium ${STATUS_BADGE[report.status]}`}>
              {STATUS_LABELS[report.status]}
            </span>
          </div>
        </div>

        <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
          {formatDistanceToNow(new Date(report.latestReportAt), { addSuffix: true })}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        )}
      </button>

      {expanded && (
        <div className="border-t-[0.5px] border-[var(--border)] px-4 py-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">Reported post</p>
              <div className="mt-2 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] p-3">
                <p className="text-[13px] font-medium text-[var(--text-primary)]">{report.postTitle}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">{report.postBody}</p>
                <Link
                  href={`/post/${report.postId}`}
                  className="mt-2 inline-block text-[12px] text-[var(--accent)] hover:underline"
                >
                  View post →
                </Link>
              </div>

              <p className="mt-3 text-[11px] font-medium text-[var(--text-muted)]">Post author</p>
              <div className="mt-2 flex items-center gap-2.5">
                <Avatar
                  initials={getInitials(report.author.name)}
                  color={getAvatarColor(report.author.id)}
                  size={28}
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{report.author.name}</p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">
                    {report.author.dept ?? '—'}
                    {report.author.year ? ` · ${report.author.year}${getYearSuffix(report.author.year)} year` : ''}
                    {' · '}
                    {report.author.warningCount} warning{report.author.warningCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                Reported by ({report.reportCount} user{report.reportCount === 1 ? '' : 's'})
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {report.reporters.slice(0, 5).map((reporter) => (
                  <div key={reporter.id} className="flex items-center gap-2.5">
                    <Avatar initials={getInitials(reporter.name)} color={getAvatarColor(reporter.id)} size={24} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-[var(--text-primary)]">{reporter.name}</p>
                      <p className="truncate text-[11px] text-[var(--text-muted)]">
                        {reporter.dept ?? '—'}
                        {reporter.year ? ` · ${reporter.year}${getYearSuffix(reporter.year)}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-1.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
                      {REASON_LABELS[reporter.reason]}
                    </span>
                  </div>
                ))}
                {report.reportCount > 5 && (
                  <p className="text-[11px] text-[var(--text-muted)]">+ {report.reportCount - 5} more reporters</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t-[0.5px] border-[var(--border)] pt-3">
            <button
              onClick={() => runModerate(report.postPinned ? 'UNPIN' : 'PIN')}
              disabled={moderating}
              title={report.postPinned ? 'Unpin post' : 'Pin post'}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border-[0.5px] transition-colors disabled:opacity-40 ${
                report.postPinned
                  ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-med)]'
              }`}
            >
              {report.postPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => runModerate(report.postLocked ? 'UNLOCK' : 'LOCK')}
              disabled={moderating}
              title={report.postLocked ? 'Unlock post' : 'Lock post'}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border-[0.5px] transition-colors disabled:opacity-40 ${
                report.postLocked
                  ? 'border-[var(--warning-border)] bg-[var(--warning-dim)] text-[var(--warning)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-med)]'
              }`}
            >
              {report.postLocked ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            </button>
            {removeConfirm ? (
              <>
                <span className="text-[12px] text-[var(--text-secondary)]">
                  Remove &quot;{report.postTitle.slice(0, 40)}&quot;? This will hide the post from all users.
                </span>
                <button
                  onClick={() => setRemoveConfirm(false)}
                  className="rounded px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    runAction('REMOVE_POST');
                    setRemoveConfirm(false);
                  }}
                  disabled={isPending}
                  className="rounded bg-[var(--danger)] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Confirm remove
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setRemoveConfirm(true)}
                  disabled={isPending}
                  className="rounded bg-[var(--danger)] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Remove post
                </button>
                <button
                  onClick={() => setWarnOpen(true)}
                  disabled={isPending}
                  className="rounded bg-[var(--warning)] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Warn author
                </button>
                <button
                  onClick={() => setBanOpen(true)}
                  disabled={isPending}
                  className="rounded border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] px-3 py-1.5 text-[12px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  Ban author
                </button>
                <button
                  onClick={() => runAction('MARK_REVIEWED')}
                  disabled={isPending}
                  className="rounded border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-3 py-1.5 text-[12px] font-medium text-[var(--success)] transition-opacity hover:opacity-80 disabled:opacity-40"
                >
                  Mark reviewed
                </button>
                <button
                  onClick={() => runAction('DISMISS')}
                  disabled={isPending}
                  className="ml-auto rounded px-3 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {warnOpen && (
        <WarnUserDialog
          open
          onOpenChange={setWarnOpen}
          userId={report.author.id}
          userName={report.author.name}
          onSuccess={() => afterWarnOrBan('WARN_AUTHOR')}
        />
      )}
      {banOpen && (
        <BanUserDialog
          open
          onOpenChange={setBanOpen}
          userId={report.author.id}
          userName={report.author.name}
          onSuccess={() => afterWarnOrBan('BAN_AUTHOR')}
        />
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? '';
  const reason = searchParams.get('reason') ?? '';
  const sort = searchParams.get('sort') ?? 'most_reported';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const updateParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (resetPage) params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const { data, isLoading, isError } = useAdminReports({ status, reason, sort, page });
  const reports = data?.reports ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Reports</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Review reported posts and take action.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total reports" value={stats?.total ?? 0} />
        <StatCard label="Pending" value={stats?.pending ?? 0} />
        <StatCard label="Action taken" value={stats?.actionTaken ?? 0} />
        <StatCard label="Dismissed" value={stats?.dismissed ?? 0} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Select value={status || 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? null : v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
            <SelectItem value="ACTION_TAKEN">Action taken</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reason || 'all'} onValueChange={(v) => updateParams({ reason: v === 'all' ? null : v })}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reasons</SelectItem>
            {Object.entries(REASON_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_reported">Most reported</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[64px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load reports" description="Something went wrong. Try refreshing the page." />
        ) : reports.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No reports yet" />
        ) : (
          reports.map((report) => <ReportCard key={report.postId} report={report} />)
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
          <span>
            Showing {from}–{to} of {total} reports
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => updateParams({ page: String(page - 1) }, false)}
              disabled={page <= 1}
              className="rounded border-[0.5px] border-[var(--border)] px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-med)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => updateParams({ page: String(page + 1) }, false)}
              disabled={to >= total}
              className="rounded border-[0.5px] border-[var(--border)] px-3 py-1.5 text-[var(--text-secondary)] transition-colors hover:border-[var(--border-med)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
