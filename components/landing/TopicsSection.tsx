'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { TOPICS } from '@/lib/constants';
import { ICON_MAP } from '@/lib/icon-map';

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function TopicsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[var(--bg-elevated)] px-6 py-12">
      <h2 className="text-[18px] font-medium text-[var(--text-primary)]">9 discussion topics</h2>
      <p className="mb-6 mt-1 text-[13px] text-[var(--text-secondary)]">
        Ask anything — get answers from peers, juniors and seniors.
      </p>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="flex flex-wrap gap-2"
      >
        {TOPICS.map((topic) => {
          const Icon = ICON_MAP[topic.icon];
          return (
            <motion.div
              key={topic.key}
              variants={item}
              className="flex cursor-default items-center gap-1.5 rounded-[20px] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-[12px] text-[var(--text-primary)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--accent)]"
            >
              <Icon className="h-[14px] w-[14px] text-[var(--accent)]" />
              {topic.label}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
