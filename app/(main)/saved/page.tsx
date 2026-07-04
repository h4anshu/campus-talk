'use client';

import { MOCK_POSTS } from '@/lib/mock';
import { useSavedPostsStore } from '@/store/useSavedPostsStore';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/shared/EmptyState';

export default function SavedPage() {
  const savedPostIds = useSavedPostsStore((s) => s.savedPostIds);
  const savedPosts = MOCK_POSTS.filter((p) => savedPostIds.includes(p.id));

  return (
    <div className="mx-auto max-w-[720px] px-4 py-5 sm:px-6">
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Saved posts</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {savedPosts.length} post{savedPosts.length === 1 ? '' : 's'} saved
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {savedPosts.length === 0 ? (
          <EmptyState title="No saved posts yet" description="Tap Save on any post to find it here later." />
        ) : (
          savedPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
