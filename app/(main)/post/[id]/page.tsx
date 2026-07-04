import Link from 'next/link';
import { MOCK_POSTS } from '@/lib/mock';
import { MOCK_COMMENTS_POST_1 } from '@/lib/mock/comments';
import PostDetail from '@/components/post/PostDetail';
import AnswerList from '@/components/answer/AnswerList';
import CommentThread from '@/components/comment/CommentThread';

interface PostPageProps {
  params: { id: string };
}

export default function PostPage({ params }: PostPageProps) {
  const post = MOCK_POSTS.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Post not found</p>
        <Link href="/home" className="text-[13px] text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  const comments = post.id === 'post-1' ? MOCK_COMMENTS_POST_1 : [];

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-4 py-5 sm:px-6">
      <PostDetail post={post} />

      <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
        {post.type === 'DISCUSSION' ? (
          <AnswerList answers={comments} postAuthorName={post.author.name} />
        ) : (
          <>
            <h2 className="mb-3 text-[16px] font-medium text-[var(--text-primary)]">Comments</h2>
            <CommentThread comments={comments} postAuthorName={post.author.name} />
          </>
        )}
      </div>
    </div>
  );
}
