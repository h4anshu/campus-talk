'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useContactAdminStore } from '@/store/useContactAdminStore';
import { useCreateTicket } from '@/hooks/useTickets';

const TYPES = [
  { key: 'QUERY', label: 'General query' },
  { key: 'REPORT', label: 'Report a post' },
  { key: 'POST_REQUEST', label: 'Post request' },
] as const;

export default function ContactAdminDialog() {
  const { open, closeDialog } = useContactAdminStore();
  const router = useRouter();
  const { mutate: createTicket, isPending } = useCreateTicket();
  const [type, setType] = useState<(typeof TYPES)[number]['key']>('QUERY');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const reset = () => {
    setType('QUERY');
    setSubject('');
    setBody('');
  };

  const canSubmit = subject.trim().length >= 3 && body.trim().length > 0 && !isPending;

  const submit = () => {
    if (!canSubmit) return;
    createTicket(
      { subject: subject.trim(), body: body.trim(), type },
      {
        onSuccess: () => {
          closeDialog();
          reset();
          toast('Ticket submitted to admin');
          router.push('/tickets');
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to submit ticket'),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeDialog();
      }}
    >
      <DialogContent
        showCloseButton
        className="max-w-[480px] gap-0 border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
      >
        <DialogTitle className="border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[16px] font-medium text-[var(--text-primary)]">
          Contact admin
        </DialogTitle>

        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`rounded-full border-[0.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  type === t.key
                    ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe your issue..."
            rows={4}
            className="w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex justify-end gap-2 border-t-[0.5px] border-[var(--border)] px-5 py-3">
          <button
            onClick={() => {
              closeDialog();
              reset();
            }}
            className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
