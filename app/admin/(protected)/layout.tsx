import { redirect } from 'next/navigation';
import { isAdminSession } from '@/lib/admin-auth';
import { PLATFORM_NAME } from '@/lib/constants';
import AdminNav from '@/components/admin/AdminNav';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // Admin auth is a single shared password, entirely separate from student
  // Google OAuth — checked here, server-side, via a signed `admin_session`
  // cookie. `/admin/login` lives outside this route group specifically so
  // this redirect can never loop back onto itself.
  if (!(await isAdminSession())) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <header className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6">
        <div className="flex items-center gap-2.5">
          <img src="/logo.svg" alt={PLATFORM_NAME} className="h-8 w-auto" />
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            {PLATFORM_NAME} <span className="text-[var(--text-muted)]">Admin</span>
          </span>
        </div>

        <AdminLogoutButton />
      </header>

      <AdminNav />

      <main className="mx-auto max-w-[880px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
