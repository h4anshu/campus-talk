'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useWarnUser } from '@/hooks/useAdminUsers';

interface WarnUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  /** Fired after the warning is sent successfully, before the dialog closes. */
  onSuccess?: () => void;
}

const MAX_LENGTH = 500;

export default function WarnUserDialog({ open, onOpenChange, userId, userName, onSuccess }: WarnUserDialogProps) {
  const [message, setMessage] = useState('');
  const { mutate: warnUser, isPending } = useWarnUser();

  const handleClose = (v: boolean) => {
    if (!v) setMessage('');
    onOpenChange(v);
  };

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    warnUser(
      { id: userId, message: trimmed },
      {
        onSuccess: () => {
          toast.success('Warning sent — user notified');
          onSuccess?.();
          handleClose(false);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to send warning'),
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
          Warn user
        </DialogTitle>

        <div className="px-5 py-4">
          <p className="text-[12px] text-[var(--text-secondary)]">
            Sending a warning to <span className="font-medium text-[var(--text-primary)]">{userName}</span>
          </p>

          <label className="mt-3 block text-[11px] text-[var(--text-muted)]">Warning message</label>
          <textarea
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="Explain why this user is being warned..."
            rows={4}
            className="mt-1 w-full resize-none rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
          <div className="mt-1 text-right text-[11px] text-[var(--text-muted)]">
            {message.length}/{MAX_LENGTH}
          </div>
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
            disabled={!message.trim() || isPending}
            className="rounded bg-[var(--warning)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send warning
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
