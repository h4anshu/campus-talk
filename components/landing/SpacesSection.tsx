'use client';

import { useRef, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import {
  HiOutlineMegaphone,
  HiOutlineCalendarDays,
  HiOutlineBookOpen,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineDocumentText,
  HiOutlineBookmark,
  HiOutlineUsers,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineBolt,
  HiOutlineHeart,
  HiOutlineChatBubbleLeftRight,
  HiArrowRight,
} from 'react-icons/hi2';
import { SPACES, type SpaceKey } from '@/lib/constants';
import CountUp from './CountUp';

type IconType = ComponentType<{ className?: string }>;

interface Stat {
  icon: IconType;
  value: number;
  label: string;
  compact?: boolean;
  suffix?: string;
}

interface SpaceMeta {
  color: string;
  icon: IconType;
  description: string;
  stats: [Stat, Stat];
}

/**
 * Per-space presentation: badge colour, icon and two headline stats.
 * Keyed by the real SpaceKey values so cards stay in sync with `SPACES`
 * and link to the real `/spaces/[space]` routes.
 */
const SPACE_META: Record<SpaceKey, SpaceMeta> = {
  announcements: {
    color: '#7C3AED',
    icon: HiOutlineMegaphone,
    description: 'Official college notices, pinned and always visible.',
    stats: [
      { icon: HiOutlineDocumentText, value: 128, label: 'posts' },
      { icon: HiOutlineBookmark, value: 12, label: 'pinned' },
    ],
  },
  events: {
    color: '#2563EB',
    icon: HiOutlineCalendarDays,
    description: 'Fests, workshops and campus events with RSVP tracking.',
    stats: [
      { icon: HiOutlineCalendarDays, value: 64, label: 'events' },
      { icon: HiOutlineUsers, value: 1240, label: 'going', compact: true },
    ],
  },
  resources: {
    color: '#0D9488',
    icon: HiOutlineBookOpen,
    description: 'Notes, PYQs and study material shared by seniors.',
    stats: [
      { icon: HiOutlineDocumentText, value: 890, label: 'files' },
      { icon: HiOutlineArrowDownTray, value: 3400, label: 'downloads', compact: true },
    ],
  },
  'lost-found': {
    color: '#DC2626',
    icon: HiOutlineMapPin,
    description: 'Report a lost item or help someone find theirs.',
    stats: [
      { icon: HiOutlineMapPin, value: 210, label: 'reports' },
      { icon: HiOutlineCheckCircle, value: 164, label: 'resolved' },
    ],
  },
  collaboration: {
    color: '#D97706',
    icon: HiOutlineUserGroup,
    description: 'Find teammates for hackathons, research and startups.',
    stats: [
      { icon: HiOutlineUserGroup, value: 145, label: 'teams' },
      { icon: HiOutlineBolt, value: 320, label: 'open slots' },
    ],
  },
  confession: {
    color: '#DB2777',
    icon: HiOutlineChatBubbleOvalLeftEllipsis,
    description: 'Share anonymously. Identity is never revealed to anyone.',
    stats: [
      { icon: HiOutlineChatBubbleLeftRight, value: 540, label: 'posts' },
      { icon: HiOutlineHeart, value: 8900, label: 'reactions', compact: true },
    ],
  },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export default function SpacesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="spaces-section" className="px-6 py-14 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">6 dedicated spaces</h2>
        <p className="mb-8 mt-1.5 text-[13px] text-[var(--text-secondary)]">
          Each space is moderated and purpose-built for college life.
        </p>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SPACES.map((space, index) => {
            const meta = SPACE_META[space.key];
            const Icon = meta.icon;
            return (
              <motion.div key={space.key} variants={item}>
                <Link
                  href={`/spaces/${space.key}`}
                  className="group block h-full focus:outline-none"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    style={{ ['--space-color' as string]: meta.color }}
                    className="flex h-full flex-col rounded-[16px] border-[0.5px] border-[var(--border)] bg-[#161929] p-5 transition-[border-color,box-shadow] duration-300 group-hover:border-[var(--space-color)] group-hover:shadow-[0_0_0_1px_var(--space-color),0_10px_30px_-12px_var(--space-color)] group-focus-visible:border-[var(--space-color)]"
                  >
                    {/* Icon badge (48x48) — subtle float loop */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.25,
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-[12px]"
                      style={{
                        backgroundColor: `${meta.color}1F`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>

                    <h3 className="mt-4 text-[15px] font-semibold text-white">{space.label}</h3>
                    <p className="mt-1.5 flex-1 text-[12px] leading-[1.6] text-[var(--text-muted)]">
                      {meta.description}
                    </p>

                    {/* Stats row + arrow */}
                    <div className="mt-5 flex items-end justify-between border-t-[0.5px] border-[var(--border)] pt-4">
                      <div className="flex gap-5">
                        {meta.stats.map((stat) => {
                          const StatIcon = stat.icon;
                          return (
                            <div key={stat.label} className="flex flex-col gap-1">
                              <div className="flex items-center gap-1 text-[13px] font-semibold text-[var(--text-primary)]">
                                <StatIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                <CountUp
                                  to={stat.value}
                                  compact={stat.compact}
                                  suffix={stat.suffix}
                                />
                              </div>
                              <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                                {stat.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border-[0.5px] border-[var(--border)] text-[var(--text-muted)] transition-colors duration-300 group-hover:text-white"
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <motion.span
                          className="flex items-center justify-center"
                          initial={false}
                          whileHover={{ x: 2 }}
                        >
                          <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
