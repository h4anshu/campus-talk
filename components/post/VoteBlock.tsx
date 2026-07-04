'use client';

import { ChevronUp, ChevronDown, EyeOff, Pin } from 'lucide-react';
import { useVote } from '@/hooks/useVote';

interface VoteBlockProps {
  postId: string;
  voteCount: number;
  userVote?: 'up' | 'down' | null;
  variant?: 'vote' | 'confession' | 'pin';
}

export default function VoteBlock({ postId, voteCount, userVote = null, variant = 'vote' }: VoteBlockProps) {
  const { mutate: vote } = useVote(postId);

  if (variant === 'confession') {
    return (
      <div className="flex w-8 flex-col items-center justify-start pt-1 text-[var(--text-muted)]">
        <EyeOff className="h-4 w-4" />
      </div>
    );
  }

  if (variant === 'pin') {
    return (
      <div className="flex w-8 flex-col items-center justify-start pt-1 text-[var(--accent)]">
        <Pin className="h-4 w-4" fill="var(--accent)" />
      </div>
    );
  }

  const toggle = (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    vote(direction);
  };

  return (
    <div className="flex w-8 flex-col items-center gap-0.5 pt-1">
      <button
        onClick={(e) => toggle(e, 'up')}
        className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
          userVote === 'up' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span
        className={`text-[12px] font-medium ${
          userVote ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
        }`}
      >
        {voteCount}
      </span>
      <button
        onClick={(e) => toggle(e, 'down')}
        className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
          userVote === 'down' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
