import { SPACES, TOPICS } from '@/lib/constants';
import type { MockPost } from '@/lib/mock/posts';
import MediaBadge from '@/components/shared/MediaBadge';

interface PostBadgesProps {
  post: MockPost;
  /** Only the compact card view shows the media indicator — the detail
   * page already renders the real media, so it'd be redundant there. */
  showMediaBadge?: boolean;
}

export default function PostBadges({ post, showMediaBadge = false }: PostBadgesProps) {
  const flair = post.topic
    ? TOPICS.find((t) => t.key === post.topic)?.label
    : post.space
      ? SPACES.find((s) => s.key === post.space)?.label
      : null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {flair && (
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
          {flair}
        </span>
      )}
      {post.pinned && (
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
          Pinned
        </span>
      )}
      {/* Only ever reachable in practice by the post's own author — the
          public feed only ever returns APPROVED posts, and the profile page
          only fetches PENDING posts for the viewer's own account. Gating on
          viewerIsAuthor too so the badge itself can never leak if that ever
          changes. */}
      {post.status === 'PENDING' && post.viewerIsAuthor && (
        <span className="rounded-full border-[0.5px] border-[var(--warning-border)] bg-[var(--warning-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--warning)]">
          Pending approval
        </span>
      )}
      {post.hot && (
        <span className="rounded-full border-[0.5px] border-[var(--warning-border)] bg-[var(--warning-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--warning)]">
          Hot
        </span>
      )}
      {post.answered && (
        <span className="rounded-full border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
          Answered
        </span>
      )}
      {post.anonymous && (
        <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
          Anonymous
        </span>
      )}
      {/* Photo/video are visual assets — they get the full-width MediaBlock
          below the text instead, so only Drive (not a visual asset) shows
          here as a small icon indicator. */}
      {showMediaBadge && <MediaBadge media={post.media?.filter((m) => m.type === 'drive')} />}
    </div>
  );
}
