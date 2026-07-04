'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import TagPill from '@/components/shared/TagPill';
import MediaBadge from '@/components/shared/MediaBadge';
import MediaBlock from '@/components/shared/MediaBlock';

const STATUS_STYLES: Record<string, string> = {
  LOST: 'border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)]',
  FOUND: 'border-[var(--success-border)] bg-[var(--success-dim)] text-[var(--success)]',
  RESOLVED: 'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-muted)]',
};

interface LostFoundCardProps {
  post: MockPost;
}

export default function LostFoundCard({ post }: LostFoundCardProps) {
  const router = useRouter();
  const status = post.lostFoundStatus ?? 'LOST';

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="cursor-pointer rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}
          >
            {status}
          </span>
          <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
            Lost &amp; Found
          </span>
          <MediaBadge media={post.media?.filter((m) => m.type === 'drive')} />
        </div>

        <div className="mt-2.5">
          <PostMeta author={post.author} createdAt={post.createdAt} />
        </div>

        <h3 className="mt-2 break-words text-[14px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 break-words text-[11px] leading-relaxed text-[var(--text-muted)]">
          {stripHtmlTags(post.body)}
        </p>

        <MediaBlock media={post.media} variant="feed" />

        {post.location && (
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
              {post.location}
            </span>
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNowStrict(post.createdAt, { addSuffix: true })}
            </span>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

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
