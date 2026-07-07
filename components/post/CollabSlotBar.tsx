'use client';

import { CheckCircle2, Minus, Plus } from 'lucide-react';
import TagPill from '@/components/shared/TagPill';
import { useCollabUpdate } from '@/hooks/useCollabUpdate';
import type { MockPost } from '@/lib/mock/posts';

interface CollabSlotBarProps {
  post: MockPost;
  isOP?: boolean;
}

export default function CollabSlotBar({ post, isOP = false }: CollabSlotBarProps) {
  const { mutate: updateCollab, isPending } = useCollabUpdate(post.id);

  // For backward compatibility with mock data that still uses `slots` object
  const totalSlots = post.collabTotalSlots ?? post.slots?.total ?? 0;
  const filledSlots = post.collabFilledSlots ?? post.slots?.filled ?? 0;
  const skills = post.collabSkills ?? post.skills ?? [];
  const isClosed = post.collabIsClosed || false;

  const full = filledSlots >= totalSlots;
  const visualFillPercent = isClosed ? 100 : Math.min(100, (filledSlots / (totalSlots || 1)) * 100);

  return (
    <div className="mt-2.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-panel)]">
        <div
          className={`h-full rounded-full ${isClosed && !full ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`}
          style={{ width: `${visualFillPercent}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[var(--text-muted)]">
            {filledSlots}/{totalSlots} slots filled
          </span>
          {skills.map((skill) => (
            <TagPill key={skill} label={skill} />
          ))}
        </div>
      </div>

      {isOP ? (
        <div className="mt-3 rounded-[8px] border border-[var(--accent-border)] bg-[var(--bg-elevated)] p-3">
          <div className="text-[11px] text-[var(--text-muted)]">Team slot management · only you see this</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (filledSlots > 0) updateCollab({ filledSlots: filledSlots - 1 });
                }}
                disabled={filledSlots <= 0 || isPending || isClosed}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-med)] bg-[var(--bg-panel)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-[12px] font-medium text-[var(--text-primary)]">{filledSlots}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (filledSlots < totalSlots) updateCollab({ filledSlots: filledSlots + 1 });
                }}
                disabled={full || isPending || isClosed}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-med)] bg-[var(--bg-panel)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {isClosed ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCollab({ isClosed: false });
                }}
                disabled={isPending}
                className="flex shrink-0 items-center gap-1.5 rounded border border-[var(--border-strong)] bg-[var(--bg-panel)] px-2 py-1 text-[11px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-page)] disabled:opacity-50"
              >
                Reopen post
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCollab({ isClosed: true });
                }}
                disabled={isPending}
                className="flex shrink-0 items-center gap-1.5 rounded border border-[var(--danger-border)] bg-[var(--danger-dim)] px-2 py-1 text-[11px] font-medium text-[var(--danger)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3 w-3" /> Mark as complete (team full)
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2">
          {isClosed ? (
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">
                This team is complete. You can no longer express interest via comments.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Interested? Drop a comment below with your skills and year.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
