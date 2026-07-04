'use client';

import { useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Reply as ReplyIcon } from 'lucide-react';
import type { MockComment } from '@/lib/mock/comments';
import { useCommentVote } from '@/hooks/useVote';
import { useCreateComment } from '@/hooks/useComments';
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
  postId: string;
  postAuthorName: string;
}

export default function CommentItem({ comment, depth, postId, postAuthorName }: CommentItemProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const { mutate: vote } = useCommentVote(postId, comment.id);
  const { mutate: createReply } = useCreateComment(postId);

  const color = DEPTH_COLORS[(depth - 1) % DEPTH_COLORS.length];
  const isOP = comment.author.name === postAuthorName;

  const addReply = (body: string) => {
    createReply(
      { postId, body, parentId: comment.id },
      { onSuccess: () => setReplying(false) }
    );
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
            Comment collapsed · {comment.replies.length > 0 ? `${comment.replies.length} replies hidden` : 'click to expand'}
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
              <p className="mt-1 break-words text-[12px] leading-relaxed text-[var(--text-secondary)] [word-break:break-word]">
                {comment.body}
              </p>

              <div className="mt-1.5 flex items-center gap-3">
                <button
                  onClick={() => vote('up')}
                  className={`flex items-center gap-1 text-[11px] transition-colors ${
                    comment.userVote === 'up' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  {comment.voteCount}
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

              {comment.replies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={depth + 1}
                      postId={postId}
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
