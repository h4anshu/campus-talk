'use client';

import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Lock, Mail, Play } from 'lucide-react';
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineCalendarDays,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineShieldCheck,
  HiOutlineNoSymbol,
  HiOutlineCheckBadge,
} from 'react-icons/hi2';
import { scrollToId } from '@/lib/scroll';

const leftContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const leftItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

interface FloatingCard {
  title: string;
  subtitle: string;
  icon: typeof HiOutlineChatBubbleLeftRight;
  color: string;
  /** Absolute-position utility classes within the illustration container. */
  position: string;
  delay: number;
}

// Four real product cards overlaid on the illustration.
const FLOATING_CARDS: FloatingCard[] = [
  {
    title: 'Discussion',
    subtitle: '12 new answers',
    icon: HiOutlineChatBubbleLeftRight,
    color: '#7C3AED',
    position: 'left-[6%] top-[12%]',
    delay: 0,
  },
  {
    title: 'Events',
    subtitle: 'Tech Fest 2025 · 48 going',
    icon: HiOutlineCalendarDays,
    color: '#2563EB',
    position: 'right-[5%] top-[7%]',
    delay: 0.5,
  },
  {
    title: 'Resources',
    subtitle: '540 files shared',
    icon: HiOutlineBookOpen,
    color: '#0D9488',
    position: 'left-[4%] bottom-[18%]',
    delay: 1,
  },
  {
    title: 'Placements',
    subtitle: '3 new opportunities',
    icon: HiOutlineBriefcase,
    color: '#DC2626',
    position: 'right-[7%] bottom-[10%]',
    delay: 1.5,
  },
];

const TRUST_BADGES = [
  { label: 'Verified students', icon: HiOutlineShieldCheck, color: 'var(--success)' },
  { label: 'No ads', icon: HiOutlineNoSymbol, color: 'var(--text-muted)' },
  { label: 'Free forever', icon: HiOutlineCheckBadge, color: 'var(--accent)' },
];

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative flex items-center overflow-hidden bg-[#0C0E17] py-16 md:h-[calc(100vh-60px)] md:py-0">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_-10%,rgba(29,78,216,0.18)_0%,transparent_55%)]" />

      {/* Right column — illustration bleeds to top/right/bottom edges (hidden below lg to avoid tablet crop) */}
      <div className="absolute inset-y-0 right-0 hidden lg:block lg:w-1/2">
        <img
          src="/hero-illustration.png"
          alt="Three students studying together at a laptop with the college building at night"
          className="h-full w-full object-cover object-top"
        />
        {/* Edge fades so the illustration bleeds into the hero background with no visible box */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #0C0E17 0%, rgba(12,14,23,0.55) 18%, transparent 44%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[14%]"
          style={{ background: 'linear-gradient(to bottom, #0C0E17, transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%]"
          style={{ background: 'linear-gradient(to top, #0C0E17, transparent)' }}
        />

        {FLOATING_CARDS.map(({ title, subtitle, icon: Icon, color, position, delay }) => (
          <motion.div
            key={title}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
            className={`absolute z-10 flex items-center gap-3 ${position}`}
            style={{
              minWidth: '160px',
              background: 'rgba(13, 17, 40, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(77, 142, 245, 0.20)',
              borderRadius: '14px',
              padding: '12px 16px',
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]"
              style={{ backgroundColor: `${color}24`, color }}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold text-white">{title}</span>
              <span className="text-[12px] text-[var(--text-muted)]">{subtitle}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Left column — text content, vertically centered against the full hero height */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col justify-center self-stretch px-6 lg:pl-[5vw] lg:pr-8">
        <motion.div
          variants={leftContainer}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left"
        >
          <motion.div
            variants={leftItem}
            className="inline-flex w-fit items-center gap-2 rounded-[20px] border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-4 py-2 text-[14px] text-[var(--accent)]"
          >
            <Lock className="h-3.5 w-3.5" />
            Only for BBD Campus students
          </motion.div>

          <motion.h1
            variants={leftItem}
            className="mt-5 text-[clamp(42px,5vw,68px)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)]"
          >
            Your college.
            <br />
            <span className="text-[var(--accent)]">One platform.</span>
          </motion.h1>

          <motion.p
            variants={leftItem}
            className="mt-5 max-w-[480px] text-[18px] leading-[1.7] text-[var(--text-secondary)]"
          >
            Ask academic questions, share notes, find project teammates, report lost items, and
            stay updated — all in one place built exclusively for your campus.
          </motion.p>

          <motion.div variants={leftItem} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--accent-fill)] px-7 py-3.5 text-[16px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Mail className="h-[18px] w-[18px]" />
              Join with college email
            </button>
            <button
              onClick={() => scrollToId('how-it-works')}
              className="flex items-center justify-center gap-2 rounded-[10px] border-[0.5px] border-[var(--border-med)] bg-transparent px-7 py-3.5 text-[16px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              <Play className="h-4 w-4" />
              See how it works
            </button>
          </motion.div>

          {/* Three trust badges */}
          <motion.div
            variants={leftItem}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-start"
          >
            {TRUST_BADGES.map(({ label, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2 text-[14px] text-[var(--text-muted)]">
                <Icon className="h-4 w-4" style={{ color }} />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
