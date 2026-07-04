import { GraduationCap, LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';
import { PLATFORM_NAME } from '@/lib/constants';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--accent-fill)]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {PLATFORM_NAME} <span className="text-[var(--text-muted)]">Admin</span>
          </span>
          {session?.user?.name && (
            <span className="ml-2 text-[12px] text-[var(--text-muted)]">{session.user.name}</span>
          )}
        </div>

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/landing' });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </form>
      </header>

      <AdminNav />

      <main className="mx-auto max-w-[880px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
