'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Eye,
  TriangleAlert,
  Ban,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import Avatar from '@/components/shared/Avatar';
import { getInitials, getAvatarColor, getYearSuffix } from '@/lib/utils';
import { getReputationTier } from '@/lib/reputation';
import { useAdminUsers, useUnbanUser, type AdminUserRow } from '@/hooks/useAdminUsers';
import WarnUserDialog from '@/components/admin/WarnUserDialog';
import BanUserDialog from '@/components/admin/BanUserDialog';
import DeleteUserDialog from '@/components/admin/DeleteUserDialog';

const BRANCHES = ['CSE', 'IT', 'ECE', 'ME', 'Civil', 'MBA'];
const PAGE_SIZE = 20;

const STATUS_BADGE: Record<AdminUserRow['status'], string> = {
  ACTIVE: 'bg-[var(--success-dim)] text-[var(--success)] border-[var(--success-border)]',
  WARNED: 'bg-[var(--warning-dim)] text-[var(--warning)] border-[var(--warning-border)]',
  BANNED: 'bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger-border)]',
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-[20px] font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`flex h-[26px] w-[26px] items-center justify-center rounded border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] transition-colors hover:border-[var(--border-med)] ${
            danger ? 'text-[var(--danger)] hover:bg-[var(--danger-dim)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function UserDetailPanel({ user }: { user: AdminUserRow }) {
  const tier = getReputationTier(user.reputation);
  return (
    <tr>
      <td colSpan={6} className="border-b-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-4 py-4">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Profile</p>
            <dl className="mt-2 space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Name</dt>
                <dd className="text-[var(--text-primary)]">{user.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Email</dt>
                <dd className="text-[var(--text-primary)]">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Branch / Year</dt>
                <dd className="text-[var(--text-primary)]">
                  {user.dept ?? '—'} {user.year ? `· ${user.year}${getYearSuffix(user.year)} year` : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Joined</dt>
                <dd className="text-[var(--text-primary)]">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Reputation</dt>
                <dd className="font-medium" style={{ color: tier.color }}>
                  {user.reputation} · {tier.label}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="text-[11px] font-medium text-[var(--text-muted)]">Activity</p>
            <dl className="mt-2 space-y-1.5 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Total posts</dt>
                <dd className="text-[var(--text-primary)]">{user._count.posts}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Comments</dt>
                <dd className="text-[var(--text-primary)]">{user._count.comments}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Warning count</dt>
                <dd className="text-[var(--text-primary)]">{user.warningCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-secondary)]">Last active</dt>
                <dd className="text-[var(--text-primary)]">
                  {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                </dd>
              </div>
              {user.status === 'BANNED' && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--text-secondary)]">Banned</dt>
                  <dd className="text-[var(--danger)]">
                    {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : '—'}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const year = searchParams.get('year') ?? '';
  const dept = searchParams.get('dept') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [warnTarget, setWarnTarget] = useState<AdminUserRow | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  const { mutate: unbanUser } = useUnbanUser();

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

  const debounceRef = useMemo(() => ({ current: null as ReturnType<typeof setTimeout> | null }), []);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParams({ search: value || null }), 300);
  };

  const { data, isLoading, isError } = useAdminUsers({ search, status, year, dept, sort, page });
  const users = data?.users ?? [];
  const stats = data?.stats;
  const total = data?.total ?? 0;

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Users</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        Manage student accounts, warnings and suspensions.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users" value={stats?.total ?? 0} />
        <StatCard label="Active" value={stats?.active ?? 0} />
        <StatCard label="Warned" value={stats?.warned ?? 0} />
        <StatCard label="Banned" value={stats?.banned ?? 0} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="min-w-[200px] flex-1 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
        />

        <Select value={status || 'all'} onValueChange={(v) => updateParams({ status: v === 'all' ? null : v })}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="WARNED">Warned</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={year || 'all'} onValueChange={(v) => updateParams({ year: v === 'all' ? null : v })}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            <SelectItem value="1">1st</SelectItem>
            <SelectItem value="2">2nd</SelectItem>
            <SelectItem value="3">3rd</SelectItem>
            <SelectItem value="4">4th</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dept || 'all'} onValueChange={(v) => updateParams({ dept: v === 'all' ? null : v })}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All branches</SelectItem>
            {BRANCHES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_posts">Most posts</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[52px] rounded bg-[var(--bg-panel)]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState title="Couldn't load users" description="Something went wrong. Try refreshing the page." />
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" description="Try adjusting your filters." />
        ) : (
          <TooltipProvider>
            <table className="w-full min-w-[720px] text-left text-[12px]">
              <thead>
                <tr className="border-b-[0.5px] border-[var(--border)] text-[11px] text-[var(--text-muted)]">
                  <th className="px-4 py-2.5 font-medium">User</th>
                  <th className="px-4 py-2.5 font-medium">Branch/Year</th>
                  <th className="px-4 py-2.5 font-medium">Posts</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <>
                    <tr key={user.id} className="border-b-[0.5px] border-[var(--border)] last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            initials={getInitials(user.name)}
                            color={getAvatarColor(user.id)}
                            src={user.image}
                            size={28}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--text-primary)]">{user.name}</p>
                            <p className="truncate text-[11px] text-[var(--text-muted)]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                        {user.dept ?? '—'} {user.year ? `· ${user.year}${getYearSuffix(user.year)}` : ''}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)]">{user._count.posts}</td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)]">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[user.status]}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <ActionButton
                            icon={Eye}
                            label="View details"
                            onClick={() => setExpandedId(expandedId === user.id ? null : user.id)}
                          />
                          <ActionButton
                            icon={TriangleAlert}
                            label="Warn user"
                            onClick={() => setWarnTarget(user)}
                          />
                          {user.status === 'BANNED' ? (
                            <ActionButton
                              icon={RotateCcw}
                              label="Restore account"
                              onClick={() =>
                                unbanUser(user.id, {
                                  onSuccess: () => toast.success('Account restored'),
                                  onError: (error) =>
                                    toast.error(error instanceof Error ? error.message : 'Failed to restore account'),
                                })
                              }
                            />
                          ) : (
                            <ActionButton icon={Ban} label="Ban user" danger onClick={() => setBanTarget(user)} />
                          )}
                          <ActionButton
                            icon={Trash2}
                            label="Delete permanently"
                            danger
                            onClick={() => setDeleteTarget(user)}
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedId === user.id && <UserDetailPanel key={`${user.id}-detail`} user={user} />}
                  </>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
          <span>
            Showing {from}–{to} of {total} users
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

      {warnTarget && (
        <WarnUserDialog
          open
          onOpenChange={(v) => !v && setWarnTarget(null)}
          userId={warnTarget.id}
          userName={warnTarget.name}
        />
      )}
      {banTarget && (
        <BanUserDialog
          open
          onOpenChange={(v) => !v && setBanTarget(null)}
          userId={banTarget.id}
          userName={banTarget.name}
        />
      )}
      {deleteTarget && (
        <DeleteUserDialog
          open
          onOpenChange={(v) => !v && setDeleteTarget(null)}
          userId={deleteTarget.id}
          userName={deleteTarget.name}
          userEmail={deleteTarget.email}
        />
      )}
    </div>
  );
}
