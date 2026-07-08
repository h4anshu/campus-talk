'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/approvals', label: 'Approvals' },
  { href: '/admin/tickets', label: 'Tickets' },
  { href: '/admin/announcements', label: 'Compose' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
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
  );
}
