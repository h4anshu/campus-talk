'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LifeBuoy, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { SPACES, TOPICS } from '@/lib/constants';
import { ICON_MAP } from '@/lib/icon-map';
import { MOCK_USER } from '@/lib/mock';
import { slugify } from '@/lib/utils';
import Avatar from '@/components/shared/Avatar';
import YearBadge from '@/components/shared/YearBadge';

const SPACE_UNREAD: Partial<Record<string, number>> = {
  announcements: 2,
  resources: 5,
};

function NavItem({
  href,
  label,
  icon,
  active,
  unread,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  unread?: number;
}) {
  const Icon = ICON_MAP[icon];
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded px-2.5 py-1.5 text-[13px] transition-colors ${
        active
          ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-secondary)]'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {!!unread && (
        <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-medium text-white">
          {unread}
        </span>
      )}
    </Link>
  );
}

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const profileHref = `/profile/${slugify(MOCK_USER.name)}`;

  return (
    <aside className="sticky top-[88px] hidden h-[calc(100vh-88px)] w-[200px] shrink-0 flex-col overflow-y-auto border-r-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-4 lg:flex">
      <Link
        href={profileHref}
        className="flex items-center gap-2.5 rounded px-1.5 py-2 transition-colors hover:bg-[var(--bg-panel)]"
      >
        <Avatar initials={MOCK_USER.initials} color={MOCK_USER.avatarColor} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
            {MOCK_USER.name}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <YearBadge year={MOCK_USER.year} />
            <span className="text-[11px] text-[var(--text-muted)]">{MOCK_USER.dept}</span>
          </div>
        </div>
      </Link>

      <div className="mt-5">
        <div className="px-2.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Spaces
        </div>
        <div className="mt-1.5 flex flex-col gap-0.5">
          {SPACES.map((space) => (
            <NavItem
              key={space.key}
              href={`/spaces/${space.key}`}
              label={space.label}
              icon={space.icon}
              active={pathname === `/spaces/${space.key}`}
              unread={SPACE_UNREAD[space.key]}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="px-2.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Discussions
        </div>
        <div className="mt-1.5 flex flex-col gap-0.5">
          {TOPICS.map((topic) => (
            <NavItem
              key={topic.key}
              href={`/discussions/${topic.key}`}
              label={topic.label}
              icon={topic.icon}
              active={pathname === `/discussions/${topic.key}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-4">
        <button
          onClick={() => toast('Ticket submitted to admin')}
          className="flex items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-secondary)]"
        >
          <LifeBuoy className="h-4 w-4" />
          Contact admin
        </button>
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-secondary)]"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
