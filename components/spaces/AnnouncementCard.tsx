'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Pin } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import TagPill from '@/components/shared/TagPill';

const PRIORITY_STYLES: Record<string, string> = {
  Critical: 'border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)]',
  Info: 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]',
  General: 'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-muted)]',
};

interface AnnouncementCardProps {
  post: MockPost;
}

export default function AnnouncementCard({ post }: AnnouncementCardProps) {
  const router = useRouter();
  const priority = post.priority ?? 'General';

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`cursor-pointer rounded-card border-[0.5px] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)] ${
        post.pinned ? 'border-[var(--accent-border)]' : 'border-[var(--border)]'
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {post.pinned && <Pin className="h-3.5 w-3.5 text-[var(--accent)]" fill="var(--accent)" />}
        <span className="flex items-center gap-1 rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          <ShieldCheck className="h-3 w-3" />
          Official
        </span>
        <span
          className={`rounded-full border-[0.5px] px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[priority]}`}
        >
          {priority}
        </span>
      </div>

      <div className="mt-2.5">
        <PostMeta author={post.author} createdAt={post.createdAt} />
      </div>

      <h3 className="mt-2 text-[14px] font-medium leading-snug text-[var(--text-primary)]">
        {post.title}
      </h3>

      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {stripHtmlTags(post.body)}
      </p>

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
      />
    </motion.div>
  );
}
