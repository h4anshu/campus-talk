'use client';

import { useState } from 'react';
import { MOCK_USER } from '@/lib/mock';
import Avatar from '@/components/shared/Avatar';

interface CommentComposerProps {
  onSubmit: (body: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export default function CommentComposer({
  onSubmit,
  onCancel,
  placeholder = 'Write a reply...',
}: CommentComposerProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <div className="mt-2 flex gap-2">
      <Avatar initials={MOCK_USER.initials} color={MOCK_USER.avatarColor} size={24} />
      <div className="flex-1">
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)] px-2.5 py-2 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
        />
        <div className="mt-1.5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded px-2.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded bg-[var(--accent-fill)] px-3 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
