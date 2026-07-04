'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  FileVideo,
  Link2,
  Image as ImageIcon,
  ThumbsUp,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import TagPill from '@/components/shared/TagPill';

const FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  ppt: Presentation,
  sheet: FileSpreadsheet,
  video: FileVideo,
  link: Link2,
};

interface ResourceCardProps {
  post: MockPost;
}

export default function ResourceCard({ post }: ResourceCardProps) {
  const router = useRouter();
  const [helpful, setHelpful] = useState(false);
  const helpfulCount = (post.helpfulCount ?? 0) + (helpful ? 1 : 0);

  // Prefer real Media rows (from a pasted/uploaded embed) over the
  // mock-only resourceType/driveUrl fields, which real API posts never
  // populate — that's what left this card blank for real resource posts.
  // The compact feed card only ever shows an icon here, never the actual
  // image/thumbnail pixels — full media is detail-page-only (Section 10).
  const imageMedia = post.media?.find((m) => m.type === 'image');
  const youtubeMedia = post.media?.find((m) => m.type === 'youtube');
  const driveMedia = post.media?.find((m) => m.type === 'drive');
  const driveUrl = driveMedia?.url ?? post.driveUrl;

  const Icon = youtubeMedia
    ? FileVideo
    : driveMedia
      ? Link2
      : imageMedia
        ? ImageIcon
        : FILE_ICONS[post.resourceType ?? 'pdf'];

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="grid cursor-pointer grid-cols-[40px_1fr] gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[9px] border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)]">
        <Icon className="h-5 w-5 text-[var(--accent)]" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
            Resources
          </span>
          {post.subject && <TagPill label={post.subject} />}
          {post.semester && <TagPill label={`Sem ${post.semester}`} />}
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

        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <TagPill key={tag} label={tag} />
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setHelpful((h) => !h);
            }}
            className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
              helpful ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <ThumbsUp className="h-3.5 w-3.5" fill={helpful ? 'var(--accent)' : 'none'} />
            Helpful · {helpfulCount}
          </button>

          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Open
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

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
