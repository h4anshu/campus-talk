'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSubmitReport } from '@/hooks/useSubmitReport';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam or misleading' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'HATE_SPEECH', label: 'Hate speech' },
  { value: 'PLAGIARISM', label: 'Plagiarism / copied content' },
  { value: 'WRONG_CATEGORY', label: 'Wrong category' },
  { value: 'OTHER', label: 'Other' },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]['value'];

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const MAX_LENGTH = 200;

export default function ReportPostDialog({ open, onOpenChange, postId }: ReportPostDialogProps) {
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [otherText, setOtherText] = useState('');
  const { mutate: submitReport, isPending } = useSubmitReport(postId);

  function handleClose() {
    setSelected(null);
    setOtherText('');
    onOpenChange(false);
  }

  function handleSubmit() {
    if (!selected) return;
    if (selected === 'OTHER' && !otherText.trim()) return;

    submitReport(
      { reason: selected, otherText: selected === 'OTHER' ? otherText.trim() : undefined },
      {
        onSuccess: () => {
          toast.success('Report submitted. We will review it shortly.');
          handleClose();
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : '';
          if (message.includes('already reported')) {
            toast.error('You have already reported this post.');
            handleClose();
          } else {
            toast.error('Failed to submit report. Please try again.');
          }
        },
      }
    );
  }

  const canSubmit = selected !== null && (selected !== 'OTHER' || otherText.trim().length > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent
        showCloseButton
        onInteractOutside={(e) => e.preventDefault()}
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
                  <p className="text-[13px] font-medium leading-none text-[var(--text-primary)]">{reason.label}</p>
                </button>
              );
            })}
          </div>

          {selected === 'OTHER' && (
            <>
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value.slice(0, MAX_LENGTH))}
                placeholder="Please describe..."
                rows={3}
                className="mt-3 w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
              <div className="mt-1 text-right text-[11px] text-[var(--text-muted)]">
                {otherText.length}/{MAX_LENGTH}
              </div>
            </>
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
            disabled={!canSubmit || isPending}
            className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            {isPending ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
