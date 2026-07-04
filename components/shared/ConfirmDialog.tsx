'use client';

import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[400px] gap-0 border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[15px] font-medium text-[var(--text-primary)]">
          {title}
        </DialogTitle>

        <p className="px-5 py-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">{description}</p>

        <div className="flex justify-end gap-2 border-t-[0.5px] border-[var(--border)] px-5 py-3">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] px-3.5 py-2 text-[12px] font-medium text-[var(--danger)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
