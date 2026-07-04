import Link from 'next/link';
import { MOCK_POSTS } from '@/lib/mock';
import { TOPICS, type TopicKey } from '@/lib/constants';
import Feed from '@/components/feed/Feed';

interface TopicPageProps {
  params: { topic: string };
}

export default function TopicPage({ params }: TopicPageProps) {
  const topic = TOPICS.find((t) => t.key === params.topic);

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

  const posts = MOCK_POSTS.filter((p) => p.topic === (params.topic as TopicKey));

  return (
    <div>
      <div className="px-4 pt-5 sm:px-6">
        <h1 className="text-[18px] font-medium text-[var(--text-primary)]">{topic.label}</h1>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          {posts.length} post{posts.length === 1 ? '' : 's'} in this topic
        </p>
      </div>
      <Feed posts={posts} />
    </div>
  );
}
