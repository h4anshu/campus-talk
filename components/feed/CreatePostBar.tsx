'use client';

import { useSession } from 'next-auth/react';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { getInitials, getAvatarColor } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';

export default function CreatePostBar() {
  const { data: session } = useSession();
  const openDialog = useCreatePostStore((s) => s.openDialog);

  return (
    <button
      onClick={openDialog}
      className="flex w-full items-center gap-3 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-left transition-colors hover:border-[var(--border-med)]"
    >
      <Avatar initials={getInitials(session?.user?.name)} color={getAvatarColor(session?.user?.id)} size={30} />
      <span className="text-[13px] text-[var(--text-muted)]">What&apos;s on your mind?</span>
    </button>
  );
}
