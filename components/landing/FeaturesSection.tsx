'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { ListChecks, MessagesSquare, EyeOff, ShieldCheck, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: ListChecks,
    iconBg: 'var(--accent-dim)',
    iconColor: 'var(--accent)',
    title: 'Q&A with accepted answers',
    description:
      'Vote the best answers up. Mark one as accepted. The right answer stays at the top — exactly like Stack Overflow.',
  },
  {
    icon: MessagesSquare,
    iconBg: 'var(--danger-dim)',
    iconColor: 'var(--danger)',
    title: 'Nested reply threads',
    description:
      'Reply to replies. Colour-coded nesting. Deep discussions that stay readable — like Reddit.',
  },
  {
    icon: EyeOff,
    iconBg: 'var(--accent-dim)',
    iconColor: 'var(--accent)',
    title: 'True anonymous posting',
    description:
      'Confessions are fully anonymous to everyone. Share without fear. Identity is never revealed.',
  },
  {
    icon: ShieldCheck,
    iconBg: 'var(--success-dim)',
    iconColor: 'var(--success)',
    title: 'Verified and moderated',
    description:
      'Only real students from your college can post. Space content is reviewed by admins before going live.',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-[var(--bg-elevated)] px-6 py-12">
      <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
        Built for students, by students
      </h2>
      <p className="mb-6 mt-1 text-[13px] text-[var(--text-secondary)]">
        The best ideas from Stack Overflow, Reddit and Quora — adapted for college.
      </p>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-[18px]"
          >
            <div
              className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-[9px]"
              style={{ backgroundColor: feature.iconBg }}
            >
              <feature.icon className="h-[18px] w-[18px]" style={{ color: feature.iconColor }} />
            </div>
            <div className="mb-1.5 text-[13px] font-medium text-[var(--text-primary)]">
              {feature.title}
            </div>
            <div className="text-[11px] leading-[1.65] text-[var(--text-muted)]">
              {feature.description}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
