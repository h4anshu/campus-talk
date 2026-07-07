'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Info, ChevronDown } from 'lucide-react';
import { getReputationTier } from '@/lib/reputation';
import { getInitials, getAvatarColor, getYearSuffix } from '@/lib/utils';
import { fetchJson } from '@/lib/api-client';
import Avatar from '@/components/shared/Avatar';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaderboardUser {
  id: string;
  name: string;
  image: string | null;
  year: number | null;
  dept: string | null;
  reputation: number;
  periodPoints?: number;
}

interface MyRank {
  rank: number;
  points: number;
}

type Filter = 'alltime' | 'month' | 'week';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'alltime', label: 'All time' },
  { key: 'month', label: 'This month' },
  { key: 'week', label: 'This week' },
];

const RULES: { label: string; pts: string; color: string }[] = [
  { label: 'Post published', pts: '+2', color: 'var(--success)' },
  { label: 'Post receives a like', pts: '+5', color: 'var(--success)' },
  { label: 'Space post approved by admin', pts: '+3', color: 'var(--success)' },
  { label: 'Comment receives a like', pts: '+3', color: 'var(--success)' },
  { label: 'Answer marked accepted', pts: '+15', color: 'var(--success)' },
  { label: 'Report confirmed by admin', pts: '+8', color: 'var(--success)' },
  { label: 'Lost & Found item returned', pts: '+10', color: 'var(--success)' },
  { label: 'Collaboration slot filled', pts: '+7', color: 'var(--success)' },
  { label: 'First post milestone', pts: '+5', color: 'var(--success)' },
  { label: '10 helpful answers milestone', pts: '+20', color: 'var(--success)' },
  { label: '50 total likes milestone', pts: '+25', color: 'var(--success)' },
  { label: 'Post receives a dislike', pts: '−2', color: 'var(--danger)' },
  { label: 'Post removed after report', pts: '−10', color: 'var(--danger)' },
  { label: 'Report dismissed as false', pts: '−3', color: 'var(--danger)' },
];

const PODIUM_STYLES = {
  gold: { border: 'rgba(217,119,6,0.3)', ring: '#D97706', color: '#D97706', medal: '🥇' },
  silver: { border: 'var(--border)', ring: '#9E9E9E', color: '#9E9E9E', medal: '🥈' },
  bronze: { border: 'var(--border)', ring: '#CD7F32', color: '#CD7F32', medal: '🥉' },
} as const;

function PodiumCard({
  user,
  place,
  filter,
}: {
  user: LeaderboardUser;
  place: keyof typeof PODIUM_STYLES;
  filter: Filter;
}) {
  const style = PODIUM_STYLES[place];
  const tier = getReputationTier(user.reputation);
  const pts = filter === 'alltime' ? user.reputation : (user.periodPoints ?? 0);

  return (
    <div
      className={`flex w-[140px] flex-col items-center rounded-card border-[0.5px] bg-[var(--bg-surface)] px-3 py-4 text-center ${
        place === 'silver' ? 'order-1 mt-6' : place === 'gold' ? 'order-2' : 'order-3 mt-10'
      }`}
      style={{ borderColor: style.border }}
    >
      <span className="text-[22px] leading-none">{style.medal}</span>
      <div className="mt-2 rounded-full" style={{ border: `2px solid ${style.ring}` }}>
        <Avatar initials={getInitials(user.name)} color={getAvatarColor(user.id)} size={48} src={user.image} />
      </div>
      <p className="mt-2 w-full truncate text-[13px] font-medium text-[var(--text-primary)]">{user.name}</p>
      <p className="truncate text-[11px] text-[var(--text-secondary)]">
        {user.year ? `${user.year}${getYearSuffix(user.year)} Year · ` : ''}
        {user.dept}
      </p>
      <p className="mt-1.5 text-[16px] font-medium" style={{ color: style.color }}>
        {pts}
      </p>
      <span
        className="mt-1 rounded-[4px] border px-1.5 py-[1px] text-[10px] font-medium"
        style={{ color: tier.color, background: `${tier.color}18`, borderColor: `${tier.color}35` }}
      >
        {tier.label}
      </span>
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<Filter>('alltime');
  const [rulesOpen, setRulesOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ['leaderboard', filter],
    queryFn: () => fetchJson<LeaderboardUser[]>(`/api/leaderboard?filter=${filter}`),
    staleTime: 60_000,
  });

  const { data: myRank } = useQuery<MyRank>({
    queryKey: ['leaderboard-me', filter],
    queryFn: () => fetchJson<MyRank>(`/api/leaderboard/me?filter=${filter}`),
    enabled: !!session?.user,
    staleTime: 60_000,
  });

  const myTier = getReputationTier(myRank?.points ?? 0);
  const podium = [users[1], users[0], users[2]].filter(Boolean) as LeaderboardUser[];
  // podium[] is in silver/gold/bronze render order; map back to which place each is.
  const podiumPlaces: (keyof typeof PODIUM_STYLES)[] = ['silver', 'gold', 'bronze'];

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
      <div className="mb-4 flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-[13px]">
        <div
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] border"
          style={{ background: 'rgba(217,119,6,0.1)', borderColor: 'rgba(217,119,6,0.2)' }}
        >
          <Trophy className="h-[17px] w-[17px]" style={{ color: '#D97706' }} />
        </div>
        <div>
          <p className="mb-[3px] text-[13px] font-medium text-[var(--text-primary)]">Leaderboard</p>
          <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">
            Top contributors at BBD Campus ranked by reputation points.
          </p>
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-[10px] border border-[var(--border)]">
        <button
          onClick={() => setRulesOpen((v) => !v)}
          className="flex w-full items-center justify-between bg-[var(--bg-elevated)] px-4 py-3 text-[13px] text-[var(--text-secondary)] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            How reputation points work
          </span>
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform"
            style={{ transform: rulesOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        {rulesOpen && (
          <div className="grid grid-cols-1 gap-1 border-t-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
            {RULES.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-b border-[var(--border)] py-[5px] last:border-0"
              >
                <span className="text-[12px] text-[var(--text-secondary)]">{r.label}</span>
                <span className="text-[12px] font-medium" style={{ color: r.color }}>
                  {r.pts}
                </span>
              </div>
            ))}
            <div className="pt-2 text-[11px] text-[var(--text-muted)]">
              Milestones are awarded once. Tier badges update automatically.
            </div>
          </div>
        )}
      </div>

      <div className="mb-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="rounded-[6px] border px-3 py-[5px] text-[12px] transition-colors"
            style={{
              background: filter === f.key ? 'rgba(77,142,245,0.12)' : 'var(--bg-elevated)',
              color: filter === f.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderColor: filter === f.key ? 'rgba(77,142,245,0.25)' : 'var(--border)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[180px] w-[140px] rounded-card bg-[var(--bg-surface)]" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[52px] rounded-[8px] bg-[var(--bg-surface)]" />
            ))}
          </div>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No reputation data yet"
          description="Start contributing — post, answer, and vote to climb the leaderboard."
        />
      ) : (
        <>
          {podium.length > 0 && (
            <div className="mb-6 flex items-end justify-center gap-3">
              {podium.map((user, i) => (
                <PodiumCard key={user.id} user={user} place={podiumPlaces[i]} filter={filter} />
              ))}
            </div>
          )}

          <div className="flex flex-col gap-[3px]">
            {users.slice(3).map((user, i) => {
              const rank = i + 4;
              const tier = getReputationTier(user.reputation);
              const isMe = user.id === session?.user?.id;
              const pts = filter === 'alltime' ? user.reputation : (user.periodPoints ?? 0);

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.18 }}
                  className="flex items-center gap-3 rounded-[8px] border px-3 py-[9px] transition-colors"
                  style={{
                    background: isMe ? 'rgba(77,142,245,0.04)' : 'transparent',
                    borderColor: isMe ? 'rgba(77,142,245,0.15)' : 'transparent',
                  }}
                >
                  <span className="w-5 shrink-0 text-center text-[12px] text-[var(--text-muted)]">{rank}</span>
                  <Avatar initials={getInitials(user.name)} color={getAvatarColor(user.id)} size={28} src={user.image} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{user.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-secondary)]">
                      {user.year ? `${user.year}${getYearSuffix(user.year)} Year · ` : ''}
                      {user.dept}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-[2px]">
                    <span className="text-[13px] font-medium text-[var(--text-primary)]">{pts}</span>
                    <span className="text-[10px]" style={{ color: tier.color }}>
                      {tier.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {myRank && (
        <div
          className="mt-4 flex items-center gap-3 rounded-[8px] border px-3 py-[10px]"
          style={{ background: 'rgba(77,142,245,0.06)', borderColor: 'rgba(77,142,245,0.18)' }}
        >
          <Avatar
            initials={getInitials(session?.user?.name)}
            color={getAvatarColor(session?.user?.id)}
            size={32}
            src={session?.user?.image}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-[var(--text-secondary)]">Your rank</p>
            <p className="text-[13px] font-medium text-[var(--text-primary)]">
              #{myRank.rank} · {myRank.points} pts
            </p>
          </div>
          <span className="shrink-0 text-[11px]" style={{ color: myTier.color }}>
            {myTier.label}
          </span>
        </div>
      )}
    </div>
  );
}
