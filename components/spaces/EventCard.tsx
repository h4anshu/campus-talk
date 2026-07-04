'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, PartyPopper } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { stripHtmlTags } from '@/lib/utils';
import PostMeta from '@/components/post/PostMeta';
import PostActions from '@/components/post/PostActions';
import TagPill from '@/components/shared/TagPill';
import Avatar from '@/components/shared/Avatar';

interface EventCardProps {
  post: MockPost;
}

export default function EventCard({ post }: EventCardProps) {
  const router = useRouter();
  const [rsvp, setRsvp] = useState<'going' | 'interested' | null>(null);

  const goingCount = (post.goingCount ?? 0) + (rsvp === 'going' ? 1 : 0);
  const interestedCount = (post.interestedCount ?? 0) + (rsvp === 'interested' ? 1 : 0);
  const attendees = post.attendees ?? [];

  const toggle = (e: React.MouseEvent, next: 'going' | 'interested') => {
    e.stopPropagation();
    setRsvp((prev) => (prev === next ? null : next));
  };

  return (
    <motion.div
      onClick={() => router.push(`/post/${post.id}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="cursor-pointer overflow-hidden rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--border-med)]"
    >
      <div className="flex h-[100px] items-center justify-center border-b-[0.5px] border-[var(--border)] bg-[var(--bg-panel)]">
        <Calendar className="h-7 w-7 text-[var(--text-muted)]" />
      </div>

      <div className="p-4">
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          Events
        </span>

        <div className="mt-2.5">
          <PostMeta author={post.author} createdAt={post.createdAt} />
        </div>

        <h3 className="mt-2 text-[14px] font-medium leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
          {stripHtmlTags(post.body)}
        </p>

        {post.eventDate && post.venue && (
          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[var(--accent)]" />
              {format(post.eventDate, 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
              {post.venue}
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

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center">
            {attendees.slice(0, 4).map((a, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }} className="rounded-full ring-2 ring-[var(--bg-surface)]">
                <Avatar initials={a.initials} color={a.avatarColor} size={22} />
              </div>
            ))}
            {goingCount > attendees.length && (
              <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">
                +{goingCount - attendees.length} going
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => toggle(e, 'going')}
              className={`flex items-center gap-1 rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                rsvp === 'going'
                  ? 'border-[var(--success-border)] bg-[var(--success-dim)] text-[var(--success)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
              }`}
            >
              <PartyPopper className="h-3 w-3" />
              Going
            </button>
            <button
              onClick={(e) => toggle(e, 'interested')}
              className={`rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                rsvp === 'interested'
                  ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
              }`}
            >
              Interested
            </button>
          </div>
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
