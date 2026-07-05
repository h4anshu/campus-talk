'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SPACES, TOPICS } from '@/lib/constants';
import { useCollegeStats } from '@/hooks/useCollegeStats';

function labelFor(segment: string, parent?: string): string {
  if (parent === 'discussions') {
    return TOPICS.find((t) => t.key === segment)?.label ?? segment;
  }
  if (parent === 'spaces') {
    return SPACES.find((s) => s.key === segment)?.label ?? segment;
  }
  const known: Record<string, string> = {
    home: 'Home',
    discussions: 'Discussions',
    spaces: 'Spaces',
    post: 'Post',
    profile: 'Profile',
    saved: 'Saved',
    tickets: 'Admin messages',
    settings: 'Settings',
  };
  return known[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { data: stats } = useCollegeStats();
  const onlineCount = stats?.online ?? '...';

  const crumbs = [{ label: 'Home', href: '/home' }];
  let acc = '';
  segments.forEach((seg, i) => {
    if (seg === 'home') return;
    acc += `/${seg}`;
    crumbs.push({ label: labelFor(seg, segments[i - 1]), href: acc });
  });

  return (
    <div className="flex h-9 items-center justify-between border-b-[0.5px] border-[var(--border)] bg-[var(--bg-page)] px-6">
      <nav className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span>›</span>}
            {i === crumbs.length - 1 ? (
              <span className="text-[var(--text-secondary)]">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="transition-colors hover:text-[var(--text-secondary)]">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
        {onlineCount} online
      </div>
    </div>
  );
}
