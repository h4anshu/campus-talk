'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Reply as ReplyIcon } from 'lucide-react';
import type { MockComment } from '@/lib/mock/comments';
import { MOCK_USER } from '@/lib/mock';
import Avatar from '@/components/shared/Avatar';
import YearBadge from '@/components/shared/YearBadge';
import CommentComposer from '@/components/comment/CommentComposer';

const DEPTH_COLORS = [
  'var(--accent)',
  'var(--success)',
  'var(--warning)',
  'var(--danger)',
  'var(--text-muted)',
];

const MAX_DEPTH = 6;

interface CommentItemProps {
  comment: MockComment;
  depth: number;
  postAuthorName: string;
}

export default function CommentItem({ comment, depth, postAuthorName }: CommentItemProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [replies, setReplies] = useState(comment.replies);

  const color = DEPTH_COLORS[(depth - 1) % DEPTH_COLORS.length];
  const isOP = comment.author.name === postAuthorName;
  const voteCount = comment.voteCount + (upvoted ? 1 : 0);

  const addReply = (body: string) => {
    const newReply: MockComment = {
      id: `${comment.id}-local-${Date.now()}`,
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
      parentId: comment.id,
      replies: [],
    };
    setReplies((prev) => [...prev, newReply]);
    setReplying(false);
  };

  return (
    <div className="flex gap-2.5">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="group relative w-3 shrink-0 cursor-pointer"
        aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
      >
        <span
          className="absolute inset-y-0 left-1 w-[2px] rounded-full transition-opacity group-hover:opacity-70"
          style={{ backgroundColor: color }}
        />
      </button>

      <div className="min-w-0 flex-1 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Avatar initials={comment.author.initials} color={comment.author.avatarColor} size={20} />
          <span className="text-[12px] font-medium text-[var(--text-primary)]">
            {comment.author.name}
          </span>
          {isOP && (
            <span className="rounded-[4px] bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--accent)]">
              OP
            </span>
          )}
          <YearBadge year={comment.author.year} />
          <span className="text-[11px] text-[var(--text-muted)]">{comment.author.dept}</span>
          <span className="text-[11px] text-[var(--text-muted)]">·</span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatDistanceToNowStrict(comment.createdAt, { addSuffix: true })}
          </span>
        </div>

        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="mt-1 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            Comment collapsed · {replies.length > 0 ? `${replies.length} replies hidden` : 'click to expand'}
          </button>
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                {comment.body}
              </p>

              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => setUpvoted((v) => !v)}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    upvoted ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  {voteCount}
                </button>

                {depth < MAX_DEPTH && (
                  <button
                    onClick={() => setReplying((r) => !r)}
                    className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
                  >
                    <ReplyIcon className="h-3.5 w-3.5" />
                    Reply
                  </button>
                )}
              </div>

              {replying && (
                <CommentComposer onSubmit={addReply} onCancel={() => setReplying(false)} />
              )}

              {replies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      postAuthorName={postAuthorName}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
