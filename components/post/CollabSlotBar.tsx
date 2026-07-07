'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import TagPill from '@/components/shared/TagPill';

interface CollabSlotBarProps {
  slots: { filled: number; total: number };
  skills: string[];
}

export default function CollabSlotBar({ slots, skills }: CollabSlotBarProps) {
  const [applied, setApplied] = useState(false);
  const full = slots.filled >= slots.total;

  return (
    <div className="mt-2.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-panel)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${(slots.filled / slots.total) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[var(--text-muted)]">
            {slots.filled}/{slots.total} slots filled
          </span>
          {skills.map((skill) => (
            <TagPill key={skill} label={skill} />
          ))}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (full || applied) return;
            setApplied(true);
            toast('Application sent to the team');
          }}
          disabled={full || applied}
          className={`flex shrink-0 items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
            applied
              ? 'bg-[var(--success-dim)] text-[var(--success)]'
              : full
                ? 'cursor-not-allowed bg-[var(--bg-panel)] text-[var(--text-muted)]'
                : 'bg-[var(--accent-fill)] text-white hover:opacity-90'
          }`}
        >
          {applied ? (
            <>
              <Check className="h-3 w-3" /> Applied
            </>
          ) : full ? (
            'Slots full'
          ) : (
            'Apply'
          )}
        </button>
      </div>
    </div>
  );
}
