'use client';

import { ThumbsUp, ThumbsDown, EyeOff, Pin } from 'lucide-react';
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

  const isUp = userVote === 'up';
  const isDown = userVote === 'down';
  const countColor = isUp ? 'var(--accent)' : isDown ? 'var(--danger)' : 'var(--text-secondary)';

  return (
    <div className="flex w-8 flex-col items-center gap-0.5 pt-1">
      <button
        onClick={(e) => toggle(e, 'up')}
        className={`flex items-center justify-center rounded-[6px] px-[6px] py-[4px] transition-colors ${
          isUp ? '' : 'hover:bg-[var(--bg-panel)]'
        }`}
        style={{ color: isUp ? 'var(--accent)' : 'var(--text-secondary)', backgroundColor: isUp ? 'rgba(77,142,245,0.12)' : 'transparent' }}
        aria-label="Like"
      >
        <ThumbsUp className="h-[17px] w-[17px]" />
      </button>
      <span className="text-[12px] font-medium" style={{ color: countColor }}>
        {voteCount}
      </span>
      <button
        onClick={(e) => toggle(e, 'down')}
        className={`flex items-center justify-center rounded-[6px] px-[6px] py-[4px] transition-colors ${
          isDown ? '' : 'hover:bg-[var(--bg-panel)]'
        }`}
        style={{ color: isDown ? 'var(--danger)' : 'var(--text-secondary)', backgroundColor: isDown ? 'rgba(220,53,69,0.10)' : 'transparent' }}
        aria-label="Dislike"
      >
        <ThumbsDown className="h-[17px] w-[17px]" />
      </button>
    </div>
  );
}
