'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { SPACES } from '@/lib/constants';
import { stripHtmlTags } from '@/lib/utils';
import PostMeta from '@/components/post/PostMeta';
import TagPill from '@/components/shared/TagPill';

interface ApprovalCardProps {
  post: MockPost;
  onApprove: () => void;
  onReject: (reason?: string) => void;
}

export default function ApprovalCard({ post, onApprove, onReject }: ApprovalCardProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const spaceLabel = SPACES.find((s) => s.key === post.space)?.label ?? post.space;

  return (
    <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
          {spaceLabel}
        </span>
        <span className="rounded-full border-[0.5px] border-[var(--warning-border)] bg-[var(--warning-dim)] px-2 py-0.5 text-[10px] font-medium text-[var(--warning)]">
          Pending review
        </span>
      </div>

      <div className="mt-2.5">
        <PostMeta author={post.author} createdAt={post.createdAt} anonymous={post.anonymous} />
      </div>

      <h3 className="mt-2 break-words text-[14px] font-medium leading-snug text-[var(--text-primary)]">
        {post.title}
      </h3>

      {/* Admin needs the full text to make an approve/reject decision, so no
          line-clamp here (unlike the public feed cards) — just break-words
          so a long unbroken string still wraps instead of overflowing. */}
      <p className="mt-1 break-words text-[12px] leading-relaxed text-[var(--text-secondary)]">
        {stripHtmlTags(post.body)}
      </p>

      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
      )}

      {rejecting && (
        <div className="mt-3 border-t-[0.5px] border-[var(--border)] pt-3">
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (optional, shown to the student)..."
            rows={2}
            className="w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-2.5 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2 border-t-[0.5px] border-[var(--border)] pt-3">
        {rejecting ? (
          <>
            <button
              onClick={() => setRejecting(false)}
              className="rounded px-3 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              onClick={() => onReject(reason.trim() || undefined)}
              className="flex items-center gap-1.5 rounded border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] px-3 py-1.5 text-[12px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80"
            >
              <X className="h-3.5 w-3.5" />
              Confirm reject
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setRejecting(true)}
              className="flex items-center gap-1.5 rounded border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] px-3 py-1.5 text-[12px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-1.5 rounded border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] px-3 py-1.5 text-[12px] font-medium text-[var(--success)] transition-opacity hover:opacity-80"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
          </>
        )}
      </div>
    </div>
  );
}
