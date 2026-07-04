'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, EyeOff, Pin } from 'lucide-react';

interface VoteBlockProps {
  initialVotes: number;
  variant?: 'vote' | 'confession' | 'pin';
}

export default function VoteBlock({ initialVotes, variant = 'vote' }: VoteBlockProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

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

  const count = initialVotes + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0);

  const toggle = (e: React.MouseEvent, next: 'up' | 'down') => {
    e.stopPropagation();
    setVote((prev) => (prev === next ? null : next));
  };

  return (
    <div className="flex w-8 flex-col items-center gap-0.5 pt-1">
      <button
        onClick={(e) => toggle(e, 'up')}
        className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
          vote === 'up' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`}
        aria-label="Upvote"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span
        className={`text-[12px] font-medium ${
          vote ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
        }`}
      >
        {count}
      </span>
      <button
        onClick={(e) => toggle(e, 'down')}
        className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
          vote === 'down' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
        }`}
        aria-label="Downvote"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
