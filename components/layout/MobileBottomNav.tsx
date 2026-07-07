'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Bookmark, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { slugify } from '@/lib/utils';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import SearchOverlay from '@/components/layout/SearchOverlay';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const openCreatePost = useCreatePostStore((s) => s.openDialog);
  const profileHref = `/profile/${slugify(session?.user?.name ?? '')}`;

  const tabs = [
    { key: 'home', label: 'Home', icon: Home, href: '/home' },
    { key: 'saved', label: 'Saved', icon: Bookmark, href: '/saved' },
    { key: 'profile', label: 'Profile', icon: User, href: profileHref },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-around border-t-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] lg:hidden">
        <Link
          href={tabs[0].href}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            pathname === tabs[0].href ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <Home className="h-5 w-5" />
          Home
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[11px] text-[var(--text-muted)]"
        >
          <Search className="h-5 w-5" />
          Search
        </button>

        <button
          onClick={openCreatePost}
          className="-mt-5 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-fill)] text-white shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </button>

        <Link
          href={tabs[1].href}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            pathname === tabs[1].href ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          Saved
        </Link>

        <Link
          href={tabs[2].href}
          className={`flex flex-col items-center gap-0.5 text-[11px] ${
            pathname === tabs[2].href ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <User className="h-5 w-5" />
          Profile
        </Link>
      </nav>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
