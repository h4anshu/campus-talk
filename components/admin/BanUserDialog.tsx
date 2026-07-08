'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useBanUser } from '@/hooks/useAdminUsers';

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  /** Fired after the ban is applied successfully, before the dialog closes. */
  onSuccess?: () => void;
}

export default function BanUserDialog({ open, onOpenChange, userId, userName, onSuccess }: BanUserDialogProps) {
  const [reason, setReason] = useState('');
  const { mutate: banUser, isPending } = useBanUser();

  const handleClose = (v: boolean) => {
    if (!v) setReason('');
    onOpenChange(v);
  };

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;

    banUser(
      { id: userId, reason: trimmed },
      {
        onSuccess: () => {
          toast.success('Account suspended');
          onSuccess?.();
          handleClose(false);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to suspend account'),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="w-full max-w-[440px] gap-0 overflow-hidden border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
      >
        <DialogTitle className="border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[16px] font-medium text-[var(--text-primary)]">
          Suspend account
        </DialogTitle>

        <div className="px-5 py-4">
          <p className="text-[12px] text-[var(--text-secondary)]">
            Suspending <span className="font-medium text-[var(--text-primary)]">{userName}</span> — they will be
            signed out immediately and cannot log back in until restored.
          </p>

          <label className="mt-3 block text-[11px] text-[var(--text-muted)]">Reason for ban</label>
          <input
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this account is being suspended..."
            className="mt-1 w-full rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t-[0.5px] border-[var(--border)] px-5 py-3">
          <button
            onClick={() => handleClose(false)}
            className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || isPending}
            className="rounded bg-[var(--danger)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suspend account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
