'use client';

import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedPage() {
  const { data: posts, isLoading, isError } = usePosts({ saved: true });
  const count = posts?.length ?? 0;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Saved posts</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {count} post{count === 1 ? '' : 's'} saved
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load posts" description="Something went wrong. Try refreshing the page." />
        ) : count === 0 ? (
          <EmptyState title="No saved posts yet" description="Tap Save on any post to find it here later." />
        ) : (
          posts!.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
