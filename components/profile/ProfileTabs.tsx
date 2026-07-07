'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNowStrict } from 'date-fns';
import { ChevronUp, CheckCircle2 } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { MOCK_POSTS } from '@/lib/mock';
import { REPUTATION_LABELS } from '@/lib/reputation';
import { useSavedPostsStore } from '@/store/useSavedPostsStore';
import { useReputationLog } from '@/hooks/useReputationLog';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/shared/EmptyState';

export interface ProfileAnswer {
  id: string;
  body: string;
  voteCount: number;
  createdAt: Date;
  accepted?: boolean;
  postId: string;
}

interface ProfileTabsProps {
  posts: MockPost[];
  answers: ProfileAnswer[];
  isOwnProfile: boolean;
}

type Tab = 'posts' | 'answers' | 'saved' | 'reputation';

export default function ProfileTabs({ posts, answers, isOwnProfile }: ProfileTabsProps) {
  const [tab, setTab] = useState<Tab>('posts');
  const savedPostIds = useSavedPostsStore((s) => s.savedPostIds);
  const savedPosts = MOCK_POSTS.filter((p) => savedPostIds.includes(p.id));
  // Enabled as soon as we know this is the viewer's own profile (not gated
  // on the tab being active) so the tab's count badge is accurate from the
  // first render, not stuck at 0 until the tab is clicked once.
  const { data: reputationLog, isLoading: reputationLoading } = useReputationLog(isOwnProfile);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'posts', label: 'Posts', count: posts.length },
    { key: 'answers', label: 'Answers', count: answers.length },
    ...(isOwnProfile
      ? [
          { key: 'saved' as Tab, label: 'Saved', count: savedPosts.length },
          { key: 'reputation' as Tab, label: 'Reputation', count: reputationLog?.length ?? 0 },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex items-center gap-1.5 border-b-[0.5px] border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              tab === t.key
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {t.label} · {t.count}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {tab === 'posts' &&
          (posts.length === 0 ? (
            <EmptyState title="No posts yet" />
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ))}

        {tab === 'answers' &&
          (answers.length === 0 ? (
            <EmptyState title="No answers yet" />
          ) : (
            answers.map((answer) => (
              <Link
                key={answer.id}
                href={`/post/${answer.postId}`}
                className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
              >
                {answer.accepted && (
                  <div className="mb-2 flex w-fit items-center gap-1.5 rounded-full border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
                    <CheckCircle2 className="h-3 w-3" />
                    Accepted answer
                  </div>
                )}
                <p className="line-clamp-2 break-words text-[12px] leading-relaxed text-[var(--text-secondary)]">
                  {answer.body}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <ChevronUp className="h-3.5 w-3.5" />
                    {answer.voteCount}
                  </span>
                  <span>{formatDistanceToNowStrict(answer.createdAt, { addSuffix: true })}</span>
                </div>
              </Link>
            ))
          ))}

        {tab === 'saved' &&
          (savedPosts.length === 0 ? (
            <EmptyState title="No saved posts" description="Posts you save will show up here." />
          ) : (
            savedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ))}

        {tab === 'reputation' &&
          (reputationLoading ? (
            <p className="py-3 text-[12px] text-[var(--text-muted)]">Loading reputation history...</p>
          ) : !reputationLog || reputationLog.length === 0 ? (
            <EmptyState
              title="No reputation events yet"
              description="Votes, approvals, and milestones you earn will show up here."
            />
          ) : (
            <div className="flex flex-col">
              {reputationLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-b-0"
                >
                  <span className="text-[13px] text-[var(--text-secondary)]">{REPUTATION_LABELS[log.reason]}</span>
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: log.points > 0 ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {log.points > 0 ? `+${log.points}` : log.points}
                  </span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
