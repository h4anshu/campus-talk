'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { EyeOff } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import PostActions from '@/components/post/PostActions';
import ReactionButtons from '@/components/post/ReactionButtons';
import TagPill from '@/components/shared/TagPill';
import MediaBadge from '@/components/shared/MediaBadge';
import MediaBlock from '@/components/shared/MediaBlock';

interface ConfessionCardProps {
  post: MockPost;
}

export default function ConfessionCard({ post }: ConfessionCardProps) {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="grid cursor-pointer grid-cols-[32px_1fr] gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
    >
      <div className="flex flex-col items-center justify-start pt-1 text-[var(--text-muted)]">
        <EyeOff className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            Confession
          </span>
          <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
            Anonymous
          </span>
          <MediaBadge media={post.media?.filter((m) => m.type === 'drive')} />
          <span className="ml-auto shrink-0 text-[11px] text-[var(--text-muted)]">
            {formatDistanceToNowStrict(post.createdAt, { addSuffix: true })}
          </span>
        </div>

        <h3 className="mt-2 break-words text-[14px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 break-words text-[11px] leading-relaxed text-[var(--text-muted)]">
          {stripHtmlTags(post.body)}
        </p>

        <MediaBlock media={post.media} variant="feed" />

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        <ReactionButtons />

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
