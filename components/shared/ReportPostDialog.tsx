'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam or misleading',
    description: 'Fake info, clickbait, or repeated posts',
  },
  {
    value: 'harassment',
    label: 'Harassment or bullying',
    description: 'Targeted attacks or personal threats',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate content',
    description: 'Offensive, adult, or graphic material',
  },
  {
    value: 'offtopic',
    label: 'Off-topic or wrong space',
    description: 'Posted in the wrong section',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Describe your reason below',
  },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]['value'];

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

export default function ReportPostDialog({ open, onOpenChange, postId }: ReportPostDialogProps) {
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [otherText, setOtherText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    setSelected(null);
    setOtherText('');
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!selected) return;
    if (selected === 'other' && !otherText.trim()) return;

    setSubmitting(true);
    // No backend endpoint yet — optimistic UX, same pattern as other placeholder actions.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    handleClose();
    toast.success('Report submitted. Our team will review it shortly.');
  }

  const canSubmit = selected !== null && (selected !== 'other' || otherText.trim().length > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-[400px] gap-0 border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="flex items-center gap-2 border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[15px] font-medium text-[var(--text-primary)]">
          <Flag className="h-4 w-4 text-[var(--accent)]" />
          Report post
        </DialogTitle>

        <div className="px-5 pt-4 pb-1">
          <p className="mb-3 text-[12px] text-[var(--text-secondary)]">Why are you reporting this post?</p>

          <div className="flex flex-col gap-1.5">
            {REPORT_REASONS.map((reason) => {
              const isSelected = selected === reason.value;
              return (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelected(reason.value)}
                  className={`flex items-center gap-3 rounded border-[0.5px] px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'border-[var(--accent-border)] bg-[var(--accent-dim)]'
                      : 'border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--border-med)]'
                  }`}
                >
                  <div
                    className={`flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-med)]'
                    }`}
                  >
                    {isSelected && <div className="h-[5px] w-[5px] rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="mb-0.5 text-[13px] font-medium leading-none text-[var(--text-primary)]">
                      {reason.label}
                    </p>
                    <p className="text-[11px] leading-none text-[var(--text-secondary)]">{reason.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {selected === 'other' && (
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell us what's wrong with this post..."
              maxLength={500}
              rows={3}
              className="mt-3 w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
