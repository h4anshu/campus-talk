'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  MessageCircle,
  BookOpen,
  CalendarDays,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Megaphone,
  Search,
  Users,
  MessageCircleMore,
  Menu,
  X,
} from 'lucide-react';
import { COLLEGE_NAME, PLATFORM_NAME } from '@/lib/constants';
import { scrollToId } from '@/lib/scroll';

/* ── Spaces dropdown data ─────────────────────────────── */
const DROPDOWN_SPACES = [
  {
    title: 'Announcements',
    subtitle: 'Official college notices',
    color: '#7C3AED',
    icon: Megaphone,
    href: '/spaces/announcements',
  },
  {
    title: 'Events',
    subtitle: 'Fests, workshops, seminars',
    color: '#2563EB',
    icon: CalendarDays,
    href: '/spaces/events',
  },
  {
    title: 'Resources',
    subtitle: 'Notes, PYQs, study material',
    color: '#0D9488',
    icon: BookOpen,
    href: '/spaces/resources',
  },
  {
    title: 'Lost & Found',
    subtitle: 'Report or find lost items',
    color: '#DC2626',
    icon: Search,
    href: '/spaces/lost-found',
  },
  {
    title: 'Collaboration',
    subtitle: 'Find teammates for projects',
    color: '#D97706',
    icon: Users,
    href: '/spaces/collaboration',
  },
  {
    title: 'Confession',
    subtitle: 'Share anonymously, safely',
    color: '#DB2777',
    icon: MessageCircleMore,
    href: '/spaces/confession',
  },
] as const;

/* ── Nav link definitions ─────────────────────────────── */
const NAV_LINKS = [
  { label: 'Discussions', icon: MessageCircle, scrollTo: 'topics-section' },
  { label: 'Resources', icon: BookOpen, scrollTo: 'spaces-section' },
  { label: 'Events', icon: CalendarDays, scrollTo: 'spaces-section' },
  { label: 'How it works', icon: HelpCircle, scrollTo: 'how-it-works' },
] as const;

/* ══════════════════════════════════════════════════════════
   LandingNav
   ══════════════════════════════════════════════════════════ */
export default function LandingNav() {
  const router = useRouter();

  /* ── Scroll state ────────────────────────────────────── */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Desktop dropdown ────────────────────────────────── */
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setDdOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Mobile menu ─────────────────────────────────────── */
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = useCallback(
    (scrollTo: string) => {
      setDdOpen(false);
      setMobileOpen(false);
      scrollToId(scrollTo);
    },
    [],
  );

  const goLogin = useCallback(() => {
    setMobileOpen(false);
    router.push('/login');
  }, [router]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50"
    >
      {/* ─── Desktop nav ─────────────────────────────────── */}
      <nav
        className={`
          hidden md:flex items-center h-16 px-8
          border-b-[0.5px] border-[rgba(255,255,255,0.08)]
          rounded-none transition-all duration-300 relative
          ${
            scrolled
              ? 'bg-[rgba(12,14,23,0.85)] backdrop-blur-[12px]'
              : 'bg-[rgba(12,14,23,0.65)] backdrop-blur-[8px]'
          }
        `}
      >
        {/* Logo ──────────────────────────── */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <img
            src="/logo.svg"
            alt={PLATFORM_NAME}
            className="h-9 w-9 rounded-[9px] object-cover"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold text-[#F0F2FA]">
              {PLATFORM_NAME}
            </span>
            <span className="text-[11px] text-[#6B7190]">
              {COLLEGE_NAME}
            </span>
          </div>
        </button>

        {/* Center nav links (absolutely centered) ───── */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          {/* Spaces dropdown trigger */}
          <div ref={ddRef} className="relative">
            <button
              onClick={() => setDdOpen((p) => !p)}
              className={`
                flex items-center gap-[5px] px-3.5 py-2 rounded-lg
                text-[13px] font-medium cursor-pointer transition-colors
                ${
                  ddOpen
                    ? 'text-[#4D8EF5] bg-[rgba(77,142,245,0.08)]'
                    : 'text-[#9EA3B8] hover:text-[#F0F2FA] hover:bg-[rgba(255,255,255,0.06)]'
                }
              `}
            >
              <LayoutGrid size={15} />
              Spaces
              {ddOpen ? (
                <ChevronUp size={11} className="text-[#4D8EF5]" />
              ) : (
                <ChevronDown size={11} className="text-[#6B7190]" />
              )}
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {ddOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="
                    absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2
                    bg-[#12151F] border-[0.5px] border-[rgba(255,255,255,0.10)]
                    rounded-xl p-2 w-[268px]
                    shadow-[0_16px_40px_rgba(0,0,0,0.5)]
                  "
                >
                  {DROPDOWN_SPACES.map((space) => (
                    <button
                      key={space.title}
                      onClick={() => {
                        setDdOpen(false);
                        router.push(space.href);
                      }}
                      className="
                        flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg
                        cursor-pointer transition-colors
                        hover:bg-[rgba(255,255,255,0.05)]
                      "
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${space.color}26`,
                        }}
                      >
                        <space.icon size={15} style={{ color: space.color }} />
                      </div>
                      <div className="text-left">
                        <div className="text-[12px] font-medium text-[#E8EAF0]">
                          {space.title}
                        </div>
                        <div className="text-[11px] text-[#6B7190] mt-px">
                          {space.subtitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Other links */}
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.scrollTo)}
              className="
                flex items-center gap-[5px] px-3.5 py-2 rounded-lg
                text-[13px] font-medium text-[#9EA3B8]
                cursor-pointer transition-colors
                hover:text-[#F0F2FA] hover:bg-[rgba(255,255,255,0.06)]
              "
            >
              <link.icon size={15} />
              {link.label}
            </button>
          ))}
        </div>

        {/* Right buttons ────────────────── */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={goLogin}
            className="
              px-[18px] py-2 rounded-lg
              border-[0.5px] border-[rgba(255,255,255,0.15)]
              bg-transparent text-[#C8CCE0] text-[13px] font-medium
              cursor-pointer transition-colors
              hover:border-[rgba(255,255,255,0.25)] hover:text-[#F0F2FA]
            "
          >
            Log in
          </button>
          <button
            onClick={goLogin}
            className="
              flex items-center gap-1.5 px-5 py-2 rounded-lg
              bg-gradient-to-br from-[#1D4ED8] to-[#2563EB]
              text-white text-[13px] font-semibold
              cursor-pointer border-none
              shadow-[0_0_20px_rgba(37,99,235,0.3)]
              transition-shadow hover:shadow-[0_0_28px_rgba(37,99,235,0.45)]
            "
          >
            Join free
            <ArrowRight size={12} />
          </button>
        </div>
      </nav>

      {/* ─── Mobile nav ──────────────────────────────────── */}
      <div className="md:hidden">
        <div
          className={`
            flex items-center justify-between h-14 px-4
            transition-all duration-300
            ${
              scrolled
                ? 'bg-[rgba(12,14,23,0.90)] backdrop-blur-[12px]'
                : 'bg-[rgba(12,14,23,0.75)] backdrop-blur-[8px]'
            }
          `}
        >
          {/* Mobile logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src="/logo.svg"
              alt={PLATFORM_NAME}
              className="h-[30px] w-[30px] rounded-[7px] object-cover"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-[#F0F2FA]">
                {PLATFORM_NAME}
              </span>
              <span className="text-[11px] text-[#6B7190]">
                {COLLEGE_NAME}
              </span>
            </div>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="p-1 cursor-pointer text-[#9EA3B8]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-[#12151F]"
            >
              <div className="py-2">
                {/* Spaces link */}
                <button
                  onClick={() => handleNavClick('spaces-section')}
                  className="
                    flex items-center gap-3 w-full px-5 py-3.5
                    text-[14px] text-[#9EA3B8]
                    cursor-pointer transition-colors
                    hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F0F2FA]
                  "
                >
                  <LayoutGrid size={16} />
                  Spaces
                </button>

                {/* Other links */}
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link.scrollTo)}
                    className="
                      flex items-center gap-3 w-full px-5 py-3.5
                      text-[14px] text-[#9EA3B8]
                      cursor-pointer transition-colors
                      hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F0F2FA]
                    "
                  >
                    <link.icon size={16} />
                    {link.label}
                  </button>
                ))}

                {/* Mobile buttons */}
                <div className="grid grid-cols-2 gap-2 px-4 py-3 mt-1 border-t-[0.5px] border-[rgba(255,255,255,0.07)]">
                  <button
                    onClick={goLogin}
                    className="
                      py-[11px] rounded-lg
                      border-[0.5px] border-[rgba(255,255,255,0.15)]
                      bg-transparent text-[#C8CCE0] text-[13px] font-medium
                      text-center cursor-pointer
                    "
                  >
                    Log in
                  </button>
                  <button
                    onClick={goLogin}
                    className="
                      py-[11px] rounded-lg
                      bg-[#2563EB] text-white text-[13px] font-semibold
                      text-center cursor-pointer
                    "
                  >
                    Join free →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
