'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SortOption } from '@/lib/constants';
import { usePosts } from '@/hooks/usePosts';
import SortBar from '@/components/feed/SortBar';
import CreatePostBar from '@/components/feed/CreatePostBar';
import PostCard from '@/components/post/PostCard';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedProps {
  topic?: string;
  space?: string;
}

export default function Feed({ topic, space }: FeedProps) {
  const [sort, setSort] = useState<SortOption>('Hot');
  const { data: posts, isLoading, isError } = usePosts({ topic, space, sort });

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
      <SortBar value={sort} onChange={setSort} />

      <div className="mx-auto w-full max-w-[720px]">
        <CreatePostBar />

        <div className="mt-4 flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[132px] rounded-card bg-[var(--bg-surface)]" />
            ))
          ) : isError ? (
            <EmptyState title="Couldn't load posts" description="Something went wrong. Try refreshing the page." />
          ) : posts && posts.length > 0 ? (
            posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))
          ) : (
            <EmptyState title="No posts yet" description="Be the first to post here." />
          )}
        </div>
      </div>
    </div>
  );
}
