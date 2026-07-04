'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { MockPost } from '@/lib/mock/posts';
import VoteBlock from '@/components/post/VoteBlock';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import CollabSlotBar from '@/components/post/CollabSlotBar';
import TagPill from '@/components/shared/TagPill';

interface CollaborationCardProps {
  post: MockPost;
}

export default function CollaborationCard({ post }: CollaborationCardProps) {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="grid cursor-pointer grid-cols-[32px_1fr] gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
    >
      <VoteBlock initialVotes={post.voteCount} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            Collaboration
          </span>
          {post.projectType && (
            <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
              {post.projectType}
            </span>
          )}
        </div>

        <div className="mt-2.5">
          <PostMeta author={post.author} createdAt={post.createdAt} />
        </div>

        <h3 className="mt-2 text-[14px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
          {post.body}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        {post.slots && <CollabSlotBar slots={post.slots} skills={post.skills ?? []} />}

        <PostActions postId={post.id} commentCount={post.commentCount} viewCount={post.viewCount} />
      </div>
    </motion.div>
  );
}
