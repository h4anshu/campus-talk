'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MockComment } from '@/lib/mock/comments';
import AnswerCard from '@/components/answer/AnswerCard';
import EmptyState from '@/components/shared/EmptyState';

interface AnswerListProps {
  answers: MockComment[];
  postAuthorName: string;
}

export default function AnswerList({ answers, postAuthorName }: AnswerListProps) {
  const [visible, setVisible] = useState(3);

  const sorted = useMemo(() => {
    return [...answers].sort((a, b) => {
      if (a.accepted && !b.accepted) return -1;
      if (!a.accepted && b.accepted) return 1;
      return b.voteCount - a.voteCount;
    });
  }, [answers]);

  if (sorted.length === 0) {
    return <EmptyState title="No answers yet" description="Be the first to answer this question." />;
  }

  const shown = sorted.slice(0, visible);
  const remaining = sorted.length - shown.length;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[16px] font-medium text-[var(--text-primary)]">
        {sorted.length} Answer{sorted.length === 1 ? '' : 's'}
      </h2>

      {shown.map((answer) => (
        <AnswerCard key={answer.id} answer={answer} postAuthorName={postAuthorName} />
      ))}

      {remaining > 0 && (
        <button
          onClick={() => setVisible((v) => v + 5)}
          className="flex items-center justify-center gap-1.5 rounded border-[0.5px] border-[var(--border)] py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-med)] hover:text-[var(--text-primary)]"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Load {Math.min(remaining, 5)} more answer{remaining === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );
}
