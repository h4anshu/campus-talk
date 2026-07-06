'use client';

import { useRef, type ComponentType } from 'react';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import {
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineCodeBracket,
  HiOutlineComputerDesktop,
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineGlobeAlt,
  HiOutlineChatBubbleLeftRight,
  HiArrowRight,
} from 'react-icons/hi2';
import { TOPICS, type TopicKey } from '@/lib/constants';
import CountUp from './CountUp';

type IconType = ComponentType<{ className?: string }>;

interface TopicMeta {
  icon: IconType;
  posts: number;
}

/**
 * Per-topic icon + headline post count, keyed by the real TopicKey values so
 * cards link to the real `/discussions/[topic]` routes.
 */
const TOPIC_META: Record<TopicKey, TopicMeta> = {
  academics: { icon: HiOutlineAcademicCap, posts: 1240 },
  assignment: { icon: HiOutlineClipboardDocumentList, posts: 860 },
  placements: { icon: HiOutlineBriefcase, posts: 2100 },
  internship: { icon: HiOutlineBuildingOffice2, posts: 940 },
  coding: { icon: HiOutlineCodeBracket, posts: 1780 },
  projects: { icon: HiOutlineComputerDesktop, posts: 620 },
  'hostel-mess': { icon: HiOutlineHome, posts: 430 },
  events: { icon: HiOutlineCalendar, posts: 510 },
  general: { icon: HiOutlineGlobeAlt, posts: 3200 },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function TopicsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="topics-section" className="bg-[var(--bg-elevated)] px-6 py-14 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">
          9 discussion topics
        </h2>
        <p className="mb-8 mt-1.5 text-[13px] text-[var(--text-secondary)]">
          Ask anything — get answers from peers, juniors and seniors.
        </p>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TOPICS.map((topic, index) => {
            const meta = TOPIC_META[topic.key];
            const Icon = meta.icon;
            return (
              <motion.div key={topic.key} variants={item}>
                <Link
                  href={`/discussions/${topic.key}`}
                  className="group block h-full focus:outline-none"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className="flex items-center gap-3.5 rounded-[14px] border-[0.5px] border-[var(--border)] bg-[#161929] p-4 transition-[border-color,box-shadow] duration-300 group-hover:border-[var(--accent-border)] group-hover:shadow-[0_0_0_1px_var(--accent-border),0_10px_28px_-14px_rgba(77,142,245,0.6)] group-focus-visible:border-[var(--accent-border)]"
                  >
                    {/* Icon badge (40x40) — subtle float loop */}
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2,
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-dim)] text-[var(--accent)]"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-white">{topic.label}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                        <HiOutlineChatBubbleLeftRight className="h-3 w-3" />
                        <CountUp to={meta.posts} compact /> posts
                      </div>
                    </div>

                    <HiArrowRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
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
