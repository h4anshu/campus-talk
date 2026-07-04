'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
    >
      <LogOut className="h-3.5 w-3.5" />
      Log out
    </button>
  );
}
