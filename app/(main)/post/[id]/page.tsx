'use client';

import Link from 'next/link';
import { usePost } from '@/hooks/usePost';
import PostDetail from '@/components/post/PostDetail';
import AnswerList from '@/components/answer/AnswerList';
import CommentThread from '@/components/comment/CommentThread';
import { Skeleton } from '@/components/ui/skeleton';

interface PostPageProps {
  params: { id: string };
}

export default function PostPage({ params }: PostPageProps) {
  const { data, isLoading, isError } = usePost(params.id);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-4 py-5 sm:px-6">
        <Skeleton className="h-[180px] rounded-card bg-[var(--bg-surface)]" />
        <Skeleton className="h-[120px] rounded-card bg-[var(--bg-surface)]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Post not found</p>
        <Link href="/home" className="text-[13px] text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  const { post, comments } = data;

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-5 px-4 py-5 sm:px-6">
      <PostDetail post={post} />

      <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
        {post.type === 'DISCUSSION' ? (
          <AnswerList
            answers={comments}
            postId={post.id}
            postAuthorName={post.author.name}
            viewerIsAuthor={post.viewerIsAuthor}
          />
        ) : (
          <>
            <h2 className="mb-3 text-[16px] font-medium text-[var(--text-primary)]">Comments</h2>
            <CommentThread comments={comments} postId={post.id} postAuthorName={post.author.name} />
          </>
        )}
      </div>
    </div>
  );
}
