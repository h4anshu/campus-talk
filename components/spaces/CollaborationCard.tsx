'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Lock } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import VoteBlock from '@/components/post/VoteBlock';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import CollabSlotBar from '@/components/post/CollabSlotBar';
import TagPill from '@/components/shared/TagPill';
import MediaBadge from '@/components/shared/MediaBadge';
import { MediaBlock } from '@/components/shared/MediaBlock';

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
      <VoteBlock postId={post.id} voteCount={post.voteCount} userVote={post.userVote} />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
            Collaboration
          </span>
          {post.projectType && (
            <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
              {post.projectType}
            </span>
          )}
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

        {post.media && post.media.length > 0 && (
          <MediaBlock
            media={post.media}
            maxHeight={260}
            className="mt-2 rounded-[8px] overflow-hidden"
          />
        )}

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        {post.space === 'collaboration' && (
          <div className="mt-2.5">
            <CollabSlotBar post={post} />
            <div className="mt-3">
              {post.collabIsClosed ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--warning-border)] bg-[var(--warning-dim)] px-2.5 py-1 text-[11px] font-medium text-[var(--warning)]">
                  <Lock className="h-3 w-3" /> Team full
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/post/${post.id}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" /> Comment to join
                </button>
              )}
            </div>
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
