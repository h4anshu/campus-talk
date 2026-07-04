'use client';

import { MOCK_USER } from '@/lib/mock';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import Avatar from '@/components/shared/Avatar';

export default function CreatePostBar() {
  const openDialog = useCreatePostStore((s) => s.openDialog);

  return (
    <button
      onClick={openDialog}
      className="flex w-full items-center gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--border-med)]"
    >
      <Avatar initials={MOCK_USER.initials} color={MOCK_USER.avatarColor} size={30} />
      <span className="text-[13px] text-[var(--text-muted)]">What&apos;s on your mind?</span>
    </button>
  );
}
