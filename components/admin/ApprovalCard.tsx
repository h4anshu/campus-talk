import { Check, X } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';
import { SPACES } from '@/lib/constants';
import PostMeta from '@/components/post/PostMeta';
import TagPill from '@/components/shared/TagPill';

interface ApprovalCardProps {
  post: MockPost;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalCard({ post, onApprove, onReject }: ApprovalCardProps) {
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

      <h3 className="mt-2 text-[14px] font-medium leading-snug text-[var(--text-primary)]">{post.title}</h3>

      <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">{post.body}</p>

      {post.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <TagPill key={tag} label={tag} />
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2 border-t-[0.5px] border-[var(--border)] pt-3">
        <button
          onClick={onReject}
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
      </div>
    </div>
  );
}
