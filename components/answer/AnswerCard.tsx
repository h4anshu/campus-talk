'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { CheckCircle2, ChevronUp, ChevronDown, Reply as ReplyIcon } from 'lucide-react';
import type { MockComment } from '@/lib/mock/comments';
import { MOCK_USER } from '@/lib/mock';
import Avatar from '@/components/shared/Avatar';
import YearBadge from '@/components/shared/YearBadge';
import CommentComposer from '@/components/comment/CommentComposer';
import CommentThread from '@/components/comment/CommentThread';

interface AnswerCardProps {
  answer: MockComment;
  postAuthorName: string;
}

export default function AnswerCard({ answer, postAuthorName }: AnswerCardProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [replying, setReplying] = useState(false);
  const [replies, setReplies] = useState(answer.replies);

  const voteCount = answer.voteCount + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0);
  const isOP = answer.author.name === postAuthorName;

  const addReply = (body: string) => {
    const newReply: MockComment = {
      id: `${answer.id}-local-${Date.now()}`,
      body,
      author: {
        name: MOCK_USER.name,
        initials: MOCK_USER.initials,
        year: MOCK_USER.year,
        dept: MOCK_USER.dept,
        avatarColor: MOCK_USER.avatarColor,
      },
      voteCount: 0,
      createdAt: new Date(),
      parentId: answer.id,
      replies: [],
    };
    setReplies((prev) => [...prev, newReply]);
    setReplying(false);
  };

  return (
    <div
      className={`grid grid-cols-[32px_1fr] gap-3 rounded-card border-[0.5px] bg-[var(--bg-surface)] p-4 ${
        answer.accepted
          ? 'border-l-[3px] border-y-[var(--border)] border-r-[var(--border)] border-l-[var(--success)]'
          : 'border-[var(--border)]'
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 pt-1">
        <button
          onClick={() => setVote((p) => (p === 'up' ? null : 'up'))}
          className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
            vote === 'up' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span
          className={`text-[12px] font-medium ${vote ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
        >
          {voteCount}
        </span>
        <button
          onClick={() => setVote((p) => (p === 'down' ? null : 'down'))}
          className={`rounded p-0.5 transition-colors hover:bg-[var(--bg-panel)] ${
            vote === 'down' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-0">
        {answer.accepted && (
          <div className="mb-2 flex w-fit items-center gap-1.5 rounded-full border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
            <CheckCircle2 className="h-3 w-3" />
            Accepted answer
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <Avatar initials={answer.author.initials} color={answer.author.avatarColor} size={22} />
          <span className="text-[12px] font-medium text-[var(--text-primary)]">
            {answer.author.name}
          </span>
          {isOP && (
            <span className="rounded-[4px] bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--accent)]">
              OP
            </span>
          )}
          <YearBadge year={answer.author.year} />
          <span className="text-[11px] text-[var(--text-muted)]">{answer.author.dept}</span>
          <span className="ml-auto shrink-0 text-[11px] text-[var(--text-muted)]">
            {formatDistanceToNowStrict(answer.createdAt, { addSuffix: true })}
          </span>
        </div>

        <p className="mt-2 text-[13px] leading-[1.7] text-[var(--text-secondary)]">{answer.body}</p>

        <button
          onClick={() => setReplying((r) => !r)}
          className="mt-2 flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <ReplyIcon className="h-3.5 w-3.5" />
          Reply
        </button>

        {replying && <CommentComposer onSubmit={addReply} onCancel={() => setReplying(false)} />}

        {replies.length > 0 && (
          <div className="mt-3 border-t-[0.5px] border-[var(--border)] pt-3">
            <CommentThread comments={replies} postAuthorName={postAuthorName} />
          </div>
        )}
      </div>
    </div>
  );
}
