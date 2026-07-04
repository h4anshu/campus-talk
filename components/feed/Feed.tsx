'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { SortOption } from '@/lib/constants';
import type { MockPost } from '@/lib/mock/posts';
import SortBar from '@/components/feed/SortBar';
import CreatePostBar from '@/components/feed/CreatePostBar';
import PostCard from '@/components/post/PostCard';

interface FeedProps {
  posts: MockPost[];
}

export default function Feed({ posts }: FeedProps) {
  const [sort, setSort] = useState<SortOption>('Hot');

  const sorted = useMemo(() => {
    const list = [...posts];
    switch (sort) {
      case 'New':
        return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'Top':
        return list.sort((a, b) => b.voteCount - a.voteCount);
      case 'Rising':
        return list.sort((a, b) => b.commentCount - a.commentCount);
      case 'Hot':
      default:
        return list.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || b.voteCount - a.voteCount);
    }
  }, [posts, sort]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4 sm:px-6">
      <SortBar value={sort} onChange={setSort} />
      <CreatePostBar />

      <div className="flex flex-col gap-3">
        {sorted.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
