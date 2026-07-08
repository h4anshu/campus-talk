'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useDeleteUser } from '@/hooks/useAdminUsers';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export default function DeleteUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}: DeleteUserDialogProps) {
  const [confirmName, setConfirmName] = useState('');
  const [blockEmail, setBlockEmail] = useState(false);
  const { mutate: deleteUser, isPending } = useDeleteUser();

  const nameMatches = confirmName.trim() === userName;

  const handleClose = (v: boolean) => {
    if (!v) {
      setConfirmName('');
      setBlockEmail(false);
    }
    onOpenChange(v);
  };

  const handleSubmit = () => {
    if (!nameMatches) return;

    deleteUser(
      { id: userId, blockEmail },
      {
        onSuccess: () => {
          toast.success('Account deleted');
          handleClose(false);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to delete account'),
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
          Delete account
        </DialogTitle>

        <div className="px-5 py-4">
          <p className="rounded-[8px] border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] px-3 py-2.5 text-[12px] text-[var(--danger)]">
            This will permanently delete <span className="font-medium">{userName}</span>&apos;s account and all
            their posts, comments, and data. This cannot be undone.
          </p>

          <label className="mt-3 flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <Checkbox checked={blockEmail} onCheckedChange={(v) => setBlockEmail(v === true)} />
            Also block {userEmail} from creating a new account
          </label>

          <label className="mt-3 block text-[11px] text-[var(--text-muted)]">
            Type <span className="font-medium text-[var(--text-primary)]">{userName}</span> to confirm
          </label>
          <input
            autoFocus
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={userName}
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
            disabled={!nameMatches || isPending}
            className="rounded bg-[var(--danger)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete permanently
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
