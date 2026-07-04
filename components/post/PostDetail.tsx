import type { MockPost } from '@/lib/mock/posts';
import VoteBlock from '@/components/post/VoteBlock';
import PostMeta from '@/components/post/PostMeta';
import PostBadges from '@/components/post/PostBadges';
import PostActions from '@/components/post/PostActions';
import ReactionButtons from '@/components/post/ReactionButtons';
import CollabSlotBar from '@/components/post/CollabSlotBar';
import TagPill from '@/components/shared/TagPill';

interface PostDetailProps {
  post: MockPost;
}

export default function PostDetail({ post }: PostDetailProps) {
  const isConfession = post.space === 'confession';
  const isAnnouncement = post.space === 'announcements';
  const isCollaboration = post.space === 'collaboration';

  const voteVariant = isConfession ? 'confession' : isAnnouncement ? 'pin' : 'vote';

  const borderClass = post.pinned
    ? 'border-[var(--accent-border)]'
    : post.hot
      ? 'border-[var(--warning-border)]'
      : 'border-[var(--border)]';

  return (
    <div
      className={`grid grid-cols-[32px_1fr] gap-4 rounded-card border-[0.5px] ${borderClass} bg-[var(--bg-surface)] p-5`}
    >
      <VoteBlock postId={post.id} voteCount={post.voteCount} userVote={post.userVote} variant={voteVariant} />

      <div className="min-w-0">
        <PostBadges post={post} />

        <div className="mt-3">
          <PostMeta author={post.author} createdAt={post.createdAt} anonymous={post.anonymous} />
        </div>

        <h1 className="mt-3 text-[20px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h1>

        {/* post.body is server-sanitized HTML (Tiptap output) — safe to render directly. */}
        <div
          className="mt-3 text-[13px] leading-[1.75] text-[var(--text-secondary)] [&_a]:text-[var(--accent)] [&_a]:underline [&_code]:rounded [&_code]:bg-[var(--bg-panel)] [&_code]:px-1 [&_code]:py-0.5 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        {isCollaboration && post.slots && (
          <CollabSlotBar slots={post.slots} skills={post.skills ?? []} />
        )}

        {isConfession && <ReactionButtons />}

        <div className="mt-3 text-[11px] text-[var(--text-muted)]">
          {voteVariant === 'vote' && `${post.voteCount} votes · `}
          {post.commentCount} {post.type === 'DISCUSSION' ? 'answers' : 'comments'} ·{' '}
          {post.viewCount} views
        </div>

        <div className="mt-1 border-t-[0.5px] border-[var(--border)] pt-1">
          <PostActions
            postId={post.id}
            commentCount={post.commentCount}
            viewCount={post.viewCount}
            isSaved={post.isSaved}
          />
        </div>
      </div>
    </div>
  );
}
