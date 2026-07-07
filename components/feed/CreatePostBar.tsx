'use client';

import { useSession } from 'next-auth/react';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { getInitials, getAvatarColor } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';

interface CreatePostBarProps {
  /** Overrides the default plain-open behavior — e.g. to lock the dialog to
   *  the current space/discussion via `openWithContext` instead of showing
   *  the full destination picker. */
  onClickOverride?: () => void;
}

export default function CreatePostBar({ onClickOverride }: CreatePostBarProps = {}) {
  const { data: session } = useSession();
  const openDialog = useCreatePostStore((s) => s.openDialog);

  return (
    <button
      onClick={onClickOverride ?? openDialog}
      className="flex w-full items-center gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--border-med)]"
    >
      <Avatar initials={getInitials(session?.user?.name)} color={getAvatarColor(session?.user?.id)} size={30} />
      <span className="text-[13px] text-[var(--text-muted)]">What&apos;s on your mind?</span>
    </button>
  );
}
