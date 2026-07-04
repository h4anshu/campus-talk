'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    title: 'Verify your email',
    description: 'Sign up with your college email. No outsiders can join.',
  },
  {
    title: 'Set up your profile',
    description: 'Add your year, department and interests.',
  },
  {
    title: 'Ask, share and connect',
    description: 'Post questions, browse resources, find teammates.',
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="px-6 py-12">
      <h2 className="text-center text-[18px] font-medium text-[var(--text-primary)] lg:text-left">
        Up and running in a minute
      </h2>
      <p className="mb-8 mt-1 text-center text-[13px] text-[var(--text-secondary)] lg:text-left">
        Three steps and you are in.
      </p>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-2"
      >
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex items-start">
            <motion.div variants={item} className="flex max-w-[200px] flex-col items-center text-center">
              <div className="mx-auto mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-full border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)]">
                <span className="text-[15px] font-medium text-[var(--accent)]">{i + 1}</span>
              </div>
              <div className="text-[13px] font-medium text-[var(--text-primary)]">{step.title}</div>
              <div className="mt-1 max-w-[180px] text-[11px] leading-[1.65] text-[var(--text-muted)]">
                {step.description}
              </div>
            </motion.div>

            {i < STEPS.length - 1 && (
              <div className="hidden shrink-0 pt-[9px] sm:mx-4 sm:flex">
                <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
