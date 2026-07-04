'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import VoteBlock from '@/components/post/VoteBlock';
import PostMeta from '@/components/post/PostMeta';
import PostBadges from '@/components/post/PostBadges';
import PostActions from '@/components/post/PostActions';
import ReactionButtons from '@/components/post/ReactionButtons';
import CollabSlotBar from '@/components/post/CollabSlotBar';
import TagPill from '@/components/shared/TagPill';
import MediaPreview from '@/components/shared/MediaPreview';

interface PostCardProps {
  post: MockPost;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
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
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`grid cursor-pointer grid-cols-[32px_1fr] gap-3 rounded-card border-[0.5px] ${borderClass} bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]`}
    >
      <VoteBlock postId={post.id} voteCount={post.voteCount} userVote={post.userVote} variant={voteVariant} />

      <div className="min-w-0">
        <PostBadges post={post} />

        <div className="mt-2">
          <PostMeta author={post.author} createdAt={post.createdAt} anonymous={post.anonymous} />
        </div>

        <h3 className="mt-2 text-[14px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
          {stripHtmlTags(post.body)}
        </p>

        <MediaPreview media={post.media} />

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        {isCollaboration && post.slots && (
          <CollabSlotBar slots={post.slots} skills={post.skills ?? []} />
        )}

        {isConfession && <ReactionButtons />}

        <PostActions
          postId={post.id}
          commentCount={post.commentCount}
          viewCount={post.viewCount}
          isSaved={post.isSaved}
          viewerIsAuthor={post.viewerIsAuthor}
        />
      </div>
    </motion.div>
  );
}
