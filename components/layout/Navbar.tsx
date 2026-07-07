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
  LogOut,
  Check,
  ThumbsUp,
  BadgeCheck,
  ShieldCheck,
  XCircle,
  Mail,
  Trophy,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { COLLEGE_NAME, PLATFORM_NAME } from '@/lib/constants';
import { slugify, getInitials, getAvatarColor } from '@/lib/utils';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { useTickets } from '@/hooks/useTickets';
import Avatar from '@/components/shared/Avatar';
import SearchOverlay from '@/components/layout/SearchOverlay';
import {
  useNotifications,
  useMarkAllRead,
  useMarkOneRead,
  useNotificationRealtime,
  type AppNotification,
} from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-medium text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  POST_LIKED:           <ThumbsUp className="w-3.5 h-3.5" style={{ color: '#4D8EF5' }} />,
  COMMENT_LIKED:        <ThumbsUp className="w-3.5 h-3.5" style={{ color: '#4D8EF5' }} />,
  POST_COMMENTED:       <MessageSquare className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
  COMMENT_REPLIED:      <MessageSquare className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
  ANSWER_ACCEPTED:      <BadgeCheck className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
  POST_APPROVED:        <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
  POST_REJECTED:        <XCircle className="w-3.5 h-3.5" style={{ color: '#DC3545' }} />,
  TICKET_REPLY:         <Mail className="w-3.5 h-3.5" style={{ color: '#D97706' }} />,
  REPORT_VERIFIED:      <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
  COLLAB_SLOT_FILLED:   <Trophy className="w-3.5 h-3.5" style={{ color: '#D97706' }} />,
  LOST_FOUND_RETURNED:  <Check className="w-3.5 h-3.5" style={{ color: '#1DB874' }} />,
};

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

  const { data: notifications = [] } = useNotifications();
  const { mutate: markAllRead } = useMarkAllRead();
  const { mutate: markOneRead } = useMarkOneRead();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Enable live realtime notification updates via Supabase
  useNotificationRealtime(user?.id);

  function handleNotifClick(n: AppNotification) {
    markOneRead(n.id);
    if (n.linkUrl) router.push(n.linkUrl);
  }

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

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative flex h-8 w-8 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)]">
                <Bell className="h-[18px] w-[18px]" style={{ color: 'var(--text-secondary)' }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
                    style={{ background: 'var(--accent-fill)' }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-[340px] p-0 border rounded-[12px]"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  Notifications {unreadCount > 0 && (
                    <span className="ml-1.5 text-[11px] px-1.5 py-[1px] rounded-full"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                      {unreadCount} new
                    </span>
                  )}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-[12px] transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className="w-full flex items-start gap-3 px-4 py-3 border-b text-left transition-colors hover:bg-[var(--bg-elevated)]"
                      style={{
                        borderColor: 'var(--border)',
                        background: n.read ? 'transparent' : 'rgba(77,142,245,0.04)',
                      }}
                    >
                      {/* Icon circle */}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--bg-panel)' }}>
                        {NOTIF_ICONS[n.type] ?? <Bell className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[13px] font-medium leading-snug"
                          style={{ color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          {n.title}
                        </p>
                        <p className="text-[12px] leading-snug mt-[2px] truncate"
                          style={{ color: 'var(--text-muted)' }}>
                          {n.body}
                        </p>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {!n.read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: 'var(--accent)' }} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

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
                <Avatar initials={getInitials(user?.name)} color={getAvatarColor(user?.id)} size={28} src={user?.image} />
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
