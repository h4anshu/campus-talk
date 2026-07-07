'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import EditProfileDialog from '@/components/profile/EditProfileDialog';

interface EditProfileButtonProps {
  user: {
    name: string;
    email: string;
    bio?: string | null;
    year?: number | null;
    dept?: string | null;
  };
}

export default function EditProfileButton({ user }: EditProfileButtonProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-[8px] border border-[var(--border-med)] bg-[var(--bg-elevated)] px-3 py-[6px] text-[13px] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit profile
      </button>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} />
    </>
  );
}
