import { SPACES, TOPICS } from '@/lib/constants';
import type { MockPost } from '@/lib/mock/posts';

interface PostBadgesProps {
  post: MockPost;
}

export default function PostBadges({ post }: PostBadgesProps) {
  const flair = post.topic
    ? TOPICS.find((t) => t.key === post.topic)?.label
    : post.space
      ? SPACES.find((s) => s.key === post.space)?.label
      : null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {flair && (
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          {flair}
        </span>
      )}
      {post.pinned && (
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          Pinned
        </span>
      )}
      {post.hot && (
        <span className="rounded-full border-[0.5px] border-[var(--warning-border)] bg-[var(--warning-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--warning)]">
          Hot
        </span>
      )}
      {post.answered && (
        <span className="rounded-full border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
          Answered
        </span>
      )}
      {post.anonymous && (
        <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
          Anonymous
        </span>
      )}
    </div>
  );
}
