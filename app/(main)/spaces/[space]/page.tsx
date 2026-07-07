'use client';

import Link from 'next/link';
import { type ComponentType, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SPACES, type SpaceKey } from '@/lib/constants';
import type { MockPost } from '@/lib/mock/posts';
import { usePosts } from '@/hooks/usePosts';
import AnnouncementCard from '@/components/spaces/AnnouncementCard';
import EventCard from '@/components/spaces/EventCard';
import ResourceCard from '@/components/spaces/ResourceCard';
import LostFoundCard from '@/components/spaces/LostFoundCard';
import CollaborationCard from '@/components/spaces/CollaborationCard';
import ConfessionCard from '@/components/spaces/ConfessionCard';
import EmptyState from '@/components/shared/EmptyState';
import { StaggeredList, StaggeredItem } from '@/components/shared/StaggeredList';
import { SectionBanner } from '@/components/shared/SectionBanner';
import CreatePostBar from '@/components/feed/CreatePostBar';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { Skeleton } from '@/components/ui/skeleton';

const SPACE_CARD_MAP: Record<SpaceKey, ComponentType<{ post: MockPost }>> = {
  announcements: AnnouncementCard,
  events: EventCard,
  resources: ResourceCard,
  'lost-found': LostFoundCard,
  collaboration: CollaborationCard,
  confession: ConfessionCard,
};

interface SpacePageProps {
  params: { space: string };
}

export default function SpacePage({ params }: SpacePageProps) {
  const space = SPACES.find((s) => s.key === params.space);
  const { data: posts, isLoading, isError } = usePosts({ space: params.space });
  const queryClient = useQueryClient();
  const openWithContext = useCreatePostStore((s) => s.openWithContext);
  const spaceKey = space?.key;

  useEffect(() => {
    if (spaceKey) {
      window.localStorage.setItem(`space_visited_${spaceKey}`, new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ['spacesUnread'] });
    }
  }, [spaceKey, queryClient]);

  if (!space) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Space not found</p>
        <Link href="/home" className="text-[13px] text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  const Card = SPACE_CARD_MAP[space.key as SpaceKey];
  const count = posts?.length ?? 0;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">{space.label}</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {count} post{count === 1 ? '' : 's'} in this space
      </p>

      <div className="mt-4">
        <SectionBanner slug={space.key} title={space.label} />
        {/* Announcements/Events are admin-only — no student-facing create
            trigger for those two, matching CreatePostDialog's DESTINATIONS
            list, which has never included them. */}
        {!space.adminOnly && (
          <div className="mb-4">
            <CreatePostBar
              onClickOverride={() =>
                openWithContext({
                  type: 'space',
                  slug: space.key,
                  label: space.label,
                  requiresApproval: !space.adminOnly,
                  isAnonymous: space.key === 'confession',
                })
              }
            />
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[132px] rounded-card bg-[var(--bg-surface)]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState title="Couldn't load posts" description="Something went wrong. Try refreshing the page." />
        ) : count === 0 ? (
          <EmptyState title={`No posts in ${space.label} yet`} description="Check back soon." />
        ) : (
          <StaggeredList className="flex flex-col gap-3">
            {posts!.map((post) => (
              <StaggeredItem key={post.id}>
                <Card post={post} />
              </StaggeredItem>
            ))}
          </StaggeredList>
        )}
      </div>
    </div>
  );
}
