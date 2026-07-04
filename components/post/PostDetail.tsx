import type { MockPost } from '@/lib/mock/posts';
import VoteBlock from '@/components/post/VoteBlock';
import PostMeta from '@/components/post/PostMeta';
import PostBadges from '@/components/post/PostBadges';
import PostActions from '@/components/post/PostActions';
import ReactionButtons from '@/components/post/ReactionButtons';
import CollabSlotBar from '@/components/post/CollabSlotBar';
import TagPill from '@/components/shared/TagPill';
import YoutubeEmbed from '@/components/media/YoutubeEmbed';
import DriveCard from '@/components/media/DriveCard';

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

        <h1 className="mt-3 break-words text-[20px] font-medium leading-snug text-[var(--text-primary)] [word-break:break-word]">
          {post.title}
        </h1>

        {/* post.body is server-sanitized HTML (Tiptap output) — safe to render directly.
            break-words + word-break together so an unbroken string (no spaces —
            e.g. a wall of repeated characters) wraps inside the card instead of
            overflowing past its edge; both are inherited, so every child element
            (p, li, a) gets it from this one place. Any inline <img> (a direct
            upload, or the .cv-embed markup a handful of older posts still have
            from before that was simplified out of the composer) gets the same
            capped-height/object-contain/letterboxed containment as MediaBlock —
            object-fit works on the <img> itself, no wrapping div needed, and its
            own background-color shows through the letterboxed gaps. */}
        <div
          className="mt-3 break-words text-[13px] leading-[1.75] text-[var(--text-secondary)] [word-break:break-word] [&_a]:text-[var(--accent)] [&_a]:underline [&_code]:rounded [&_code]:bg-[var(--bg-panel)] [&_code]:px-1 [&_code]:py-0.5 [&_img]:mt-2 [&_img]:block [&_img]:w-full [&_img]:min-h-[140px] [&_img]:max-h-[500px] [&_img]:rounded-[9px] [&_img]:bg-[var(--bg-page)] [&_img]:object-contain [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc [&_.cv-embed]:my-2 [&_.cv-embed]:block [&_.cv-embed]:max-w-full [&_.cv-embed]:overflow-hidden [&_.cv-embed]:rounded-[9px] [&_.cv-embed]:border [&_.cv-embed]:border-[var(--border)] [&_.cv-embed-drive]:bg-[var(--bg-panel)] [&_.cv-embed-drive_a]:block [&_.cv-embed-drive_a]:p-3 [&_.cv-embed-drive_a]:text-[var(--accent)]"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Real playable YouTube (thumbnail + click-to-play, replacing the
            iframe cost until requested) / Drive link card — driven off the
            Media rows, this is the actual hero media, not the inline body. */}
        {post.media?.filter((m) => m.type === 'youtube' && m.providerId).map((m) => (
          <YoutubeEmbed key={m.url} videoId={m.providerId!} thumbnailUrl={m.thumbnailUrl ?? undefined} />
        ))}
        {post.media?.filter((m) => m.type === 'drive').map((m) => (
          <DriveCard key={m.url} url={m.url} />
        ))}

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
            viewerIsAuthor={post.viewerIsAuthor}
          />
        </div>
      </div>
    </div>
  );
}
