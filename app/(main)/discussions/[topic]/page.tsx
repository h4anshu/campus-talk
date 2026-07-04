'use client';

import Link from 'next/link';
import { TOPICS, type TopicKey } from '@/lib/constants';
import { usePosts } from '@/hooks/usePosts';
import Feed from '@/components/feed/Feed';

interface TopicPageProps {
  params: { topic: string };
}

export default function TopicPage({ params }: TopicPageProps) {
  const topicParam = params.topic;
  const topic = TOPICS.find((t) => t.key === topicParam);
  const { data: posts } = usePosts({ topic: topicParam });

  if (!topic) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Topic not found</p>
        <Link href="/home" className="text-[13px] text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  const count = posts?.length ?? 0;

  return (
    <div>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-[18px] font-medium text-[var(--text-primary)]">{topic.label}</h1>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          {count} post{count === 1 ? '' : 's'} in this topic
        </p>
      </div>
      <Feed topic={topicParam as TopicKey} />
    </div>
  );
}
