'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAdminSessionStore } from '@/store/useAdminSessionStore';
import { PLATFORM_NAME } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/admin/approvals', label: 'Approvals' },
  { href: '/admin/tickets', label: 'Tickets' },
  { href: '/admin/announcements', label: 'Compose' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminAuthenticated = useAdminSessionStore((s) => s.isAdminAuthenticated);
  const logout = useAdminSessionStore((s) => s.logout);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, isAdminAuthenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAdminAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

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
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </header>

      <nav className="flex items-center gap-1 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors ${
              pathname === item.href
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <main className="mx-auto max-w-[880px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
