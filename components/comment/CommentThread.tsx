'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MockComment } from '@/lib/mock/comments';
import CommentItem from '@/components/comment/CommentItem';
import EmptyState from '@/components/shared/EmptyState';

interface CommentThreadProps {
  comments: MockComment[];
  postAuthorName: string;
  initialVisible?: number;
}

export default function CommentThread({
  comments,
  postAuthorName,
  initialVisible = 3,
}: CommentThreadProps) {
  const [visible, setVisible] = useState(initialVisible);

  if (comments.length === 0) {
    return <EmptyState title="No comments yet" description="Be the first to reply." />;
  }

  const shown = comments.slice(0, visible);
  const remaining = comments.length - shown.length;

  return (
    <div className="flex flex-col gap-3">
      {shown.map((comment) => (
        <CommentItem key={comment.id} comment={comment} depth={1} postAuthorName={postAuthorName} />
      ))}

      {remaining > 0 && (
        <button
          onClick={() => setVisible((v) => v + 5)}
          className="flex items-center justify-center gap-1.5 rounded border-[0.5px] border-[var(--border)] py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-med)] hover:text-[var(--text-primary)]"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Load {Math.min(remaining, 5)} more comment{remaining === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
}
