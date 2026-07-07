'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSession, signOut } from 'next-auth/react';
import {
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
import { slugify, getInitials, getAvatarColor } from '@/lib/utils';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { useTickets } from '@/hooks/useTickets';
import Avatar from '@/components/shared/Avatar';
import SearchOverlay from '@/components/layout/SearchOverlay';
import {
  useNotifications,
  useMarkNotificationsRead,
  useNotificationsRealtime,
} from '@/hooks/useNotifications';

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
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const openCreatePost = useCreatePostStore((s) => s.openDialog);
  const user = session?.user;
  const profileHref = `/profile/${slugify(user?.name ?? '')}`;
  const { data: tickets } = useTickets();
  const openTicketCount = tickets?.filter((t) => t.status !== 'RESOLVED').length ?? 0;
  const unreadTicketCount = tickets?.filter((t) => t.unread).length ?? 0;

  const { data: notificationsData } = useNotifications();
  const { mutate: markNotificationsRead } = useMarkNotificationsRead();
  const unreadNotificationCount = notificationsData?.unreadCount ?? 0;
  const notificationsList = notificationsData?.notifications ?? [];

  // Enable live realtime notification updates via Supabase
  useNotificationsRealtime(user?.id);

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
        className="sticky top-0 z-50 flex h-[52px] items-center justify-between gap-2 border-b-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 sm:gap-4 sm:px-6"
      >
        <Link href="/home" className="flex shrink-0 items-center gap-2.5">
          <img src="/logo.svg" alt={PLATFORM_NAME} className="h-8 w-auto" />
          <div className="hidden flex-col leading-none sm:flex">
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              {PLATFORM_NAME}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">{COLLEGE_NAME}</span>
          </div>
        </Link>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex min-w-0 w-full max-w-[420px] items-center gap-2 rounded border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-1.5 text-left transition-colors hover:border-[var(--border-med)]"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--text-muted)]">
            Search Campus Thread...
          </span>
          <kbd className="hidden shrink-0 rounded border-[0.5px] border-[var(--border-med)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)] sm:block">
            Ctrl K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-8 w-8 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]">
                <MessageSquare className="h-[18px] w-[18px]" />
                <NavBadge count={unreadTicketCount} />
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
              <DropdownMenuItem className="text-[12px]" onClick={() => router.push('/tickets')}>
                {unreadTicketCount > 0 ? (
                  <>You have {unreadTicketCount} unread ticket reply{unreadTicketCount === 1 ? '' : 'ies'}</>
                ) : (
                  <>No unread messages</>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu onOpenChange={(open) => { if (open) markNotificationsRead(); }}>
            <DropdownMenuTrigger asChild>
              <button className="relative flex h-8 w-8 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]">
                <Bell className="h-[18px] w-[18px]" />
                <NavBadge count={unreadNotificationCount} />
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
              {notificationsList.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-[var(--text-muted)]">
                  No notifications yet
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {notificationsList.slice(0, 5).map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className="flex flex-col items-start gap-0.5 text-[11px] py-2 border-b-[0.5px] border-[var(--border)] last:border-b-0"
                      onClick={() => router.push(`/post/${notif.postId}`)}
                    >
                      <div className="text-[var(--text-primary)]">
                        {notif.type === 'COMMENT' ? (
                          <><strong>{notif.actor?.name}</strong> commented on your post</>
                        ) : (
                          <><strong>{notif.actor?.name}</strong> replied to your comment</>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate max-w-full">
                        {notif.post?.title}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
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
                <Avatar initials={getInitials(user?.name)} color={getAvatarColor(user?.id)} size={28} online src={user?.image} />
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
            >
              <DropdownMenuLabel className="text-[12px] text-[var(--text-secondary)]">
                {user?.name}
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
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push('/tickets')}>
                <ShieldQuestion className="h-4 w-4" />
                Admin messages
                {openTicketCount > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--danger)] px-1.5 text-[10px] text-white">
                    {openTicketCount}
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem className="gap-2 text-[13px]" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 text-[13px] text-[#F26571] focus:text-[#F26571]"
                onClick={() => signOut({ callbackUrl: '/landing' })}
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
