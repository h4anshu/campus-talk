'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  GraduationCap,
  Search,
  MessageSquare,
  Bell,
  Plus,
  ChevronDown,
  User,
  FileText,
  Bookmark,
  ShieldQuestion,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { COLLEGE_NAME, PLATFORM_NAME } from '@/lib/constants';
import { MOCK_USER } from '@/lib/mock';
import { slugify } from '@/lib/utils';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import Avatar from '@/components/shared/Avatar';
import SearchOverlay from '@/components/layout/SearchOverlay';

const MESSAGE_COUNT = 3;
const NOTIFICATION_COUNT = 5;
const ADMIN_MESSAGE_COUNT = 2;

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-medium text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const openCreatePost = useCreatePostStore((s) => s.openDialog);
  const profileHref = `/profile/${slugify(MOCK_USER.name)}`;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 flex h-[52px] items-center justify-between gap-4 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6"
      >
        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--accent-fill)]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div className="hidden flex-col leading-none sm:flex">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              {PLATFORM_NAME}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{COLLEGE_NAME}</span>
          </div>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex w-full max-w-[420px] items-center gap-2 rounded border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-1.5 text-left transition-colors hover:border-[var(--border-med)]"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          <span className="flex-1 truncate text-[12px] text-[var(--text-muted)]">
            Search CampusVoice...
          </span>
          <kbd className="hidden shrink-0 rounded border-[0.5px] border-[var(--border-med)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] sm:block">
            Ctrl K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-8 w-8 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]">
                <MessageSquare className="h-[18px] w-[18px]" />
                <NavBadge count={MESSAGE_COUNT} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[240px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              <DropdownMenuLabel className="text-[12px] text-[var(--text-secondary)]">
                Messages
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem className="text-[12px]" onClick={() => toast('Messages — coming soon')}>
                You have {MESSAGE_COUNT} unread messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-8 w-8 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]">
                <Bell className="h-[18px] w-[18px]" />
                <NavBadge count={NOTIFICATION_COUNT} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[240px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              <DropdownMenuLabel className="text-[12px] text-[var(--text-secondary)]">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem className="text-[12px]" onClick={() => router.push('/home')}>
                {NOTIFICATION_COUNT} new notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={openCreatePost}
            className="ml-1 hidden items-center gap-1.5 rounded bg-[var(--accent-fill)] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 sm:flex"
          >
            <Plus className="h-3.5 w-3.5" />
            Create post
          </button>
          <button
            onClick={openCreatePost}
            className="flex h-8 w-8 items-center justify-center rounded bg-[var(--accent-fill)] text-white sm:hidden"
          >
            <Plus className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-1 rounded py-1 pl-1 pr-1.5 transition-colors hover:bg-[var(--bg-panel)]">
                <Avatar initials={MOCK_USER.initials} color={MOCK_USER.avatarColor} size={28} online />
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              <DropdownMenuLabel className="text-[12px] text-[var(--text-secondary)]">
                {MOCK_USER.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push(profileHref)}>
                <User className="h-4 w-4" /> View profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push(profileHref)}>
                <FileText className="h-4 w-4" /> My posts
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push('/saved')}>
                <Bookmark className="h-4 w-4" /> Saved posts
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => toast('Admin messages — coming soon')}>
                <ShieldQuestion className="h-4 w-4" />
                Admin messages
                {ADMIN_MESSAGE_COUNT > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--danger)] px-1.5 text-[10px] text-white">
                    {ADMIN_MESSAGE_COUNT}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-[13px] text-[var(--danger)] focus:text-[var(--danger)]"
                onClick={() => router.push('/landing')}
              >
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <SearchOverlay open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
