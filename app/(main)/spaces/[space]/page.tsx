'use client';

import Link from 'next/link';
import type { ComponentType } from 'react';
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

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load posts" description="Something went wrong. Try refreshing the page." />
        ) : count === 0 ? (
          <EmptyState title={`No posts in ${space.label} yet`} description="Check back soon." />
        ) : (
          posts!.map((post) => <Card key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
