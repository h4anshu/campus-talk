import { MOCK_POSTS } from '@/lib/mock';
import Feed from '@/components/feed/Feed';

export default function HomePage() {
  return <Feed posts={MOCK_POSTS.slice(0, 5)} />;
}
