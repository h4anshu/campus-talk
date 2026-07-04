'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { SPACES } from '@/lib/constants';
import { ICON_MAP } from '@/lib/icon-map';

const DESCRIPTIONS: Record<string, string> = {
  announcements: 'Official college notices pinned and always visible.',
  events: 'Fests, workshops and campus events with RSVP tracking.',
  resources: 'Notes, PYQs and study material shared by seniors.',
  'lost-found': 'Report a lost item or help someone find theirs.',
  collaboration: 'Find teammates for hackathons, research and startups.',
  confession: 'Share anonymously. Identity is never revealed to anyone.',
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SpacesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 py-12">
      <h2 className="text-[18px] font-medium text-[var(--text-primary)]">6 dedicated spaces</h2>
      <p className="mb-6 mt-1 text-[13px] text-[var(--text-secondary)]">
        Each space is moderated and purpose-built for college life.
      </p>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-2 gap-[10px] sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(168px,1fr))]"
      >
        {SPACES.map((space) => {
          const Icon = ICON_MAP[space.icon];
          return (
            <motion.div
              key={space.key}
              variants={item}
              whileHover={{ y: -2 }}
              className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--border-med)]"
            >
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)]">
                <Icon className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div className="mt-2.5 text-[13px] font-medium text-[var(--text-primary)]">
                {space.label}
              </div>
              <div className="mt-1 text-[11px] leading-[1.5] text-[var(--text-muted)]">
                {DESCRIPTIONS[space.key]}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
