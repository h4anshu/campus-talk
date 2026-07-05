'use client';

import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { scrollToId } from '@/lib/scroll';

const leftContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const leftItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

const rightContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const rightItem: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-[#0D1020] px-6 py-16 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(29,78,216,0.15)_0%,transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-10 sm:flex-row sm:items-start sm:gap-10 lg:gap-16">
        <motion.div
          variants={leftContainer}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-1 flex-col items-center text-center sm:items-start sm:text-left"
        >
          <motion.div
            variants={leftItem}
            className="inline-flex w-fit items-center gap-1.5 rounded-[20px] border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)] px-3 py-1.5 text-[11px] text-[var(--accent)]"
          >
            <Lock className="h-3 w-3" />
            Only for BBD Campus students
          </motion.div>

          <motion.h1
            variants={leftItem}
            className="mt-4 text-[clamp(28px,4vw,42px)] font-medium leading-tight text-[var(--text-primary)]"
          >
            Your college.
            <br />
            <span className="text-[var(--accent)]">One platform.</span>
          </motion.h1>

          <motion.p
            variants={leftItem}
            className="mt-3 max-w-[380px] text-[13px] leading-[1.75] text-[var(--text-secondary)]"
          >
            Ask academic questions, share notes, find project teammates, report lost items, and
            stay updated — all in one place built exclusively for your campus.
          </motion.p>

          <motion.div
            variants={leftItem}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <button
              onClick={() => router.push('/login')}
              className="flex items-center justify-center gap-2 rounded bg-[var(--accent-fill)] px-5 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" />
              Join with college email
            </button>
            <button
              onClick={() => scrollToId('how-it-works')}
              className="flex items-center justify-center rounded border-[0.5px] border-[var(--border-med)] bg-transparent px-4 py-2.5 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              See how it works
            </button>
          </motion.div>

          <motion.p variants={leftItem} className="mt-3.5 text-[11px] text-[var(--text-muted)]">
            Verified students only · No ads · Free forever
          </motion.p>
        </motion.div>

        <motion.div
          variants={rightContainer}
          initial="hidden"
          animate="visible"
          className="hidden w-[180px] shrink-0 flex-col gap-2 sm:flex lg:w-[230px]"
        >
          <motion.div
            variants={rightItem}
            className="rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[13px] py-[11px]"
          >
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Placements · 47 votes
            </div>
            <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
              How to get placed at a startup with no internship?
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px]">
              <span className="text-[var(--text-muted)]">23 answers</span>
              <span className="text-[var(--success)]">Answered</span>
            </div>
          </motion.div>

          <motion.div
            variants={rightItem}
            className="rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[13px] py-[11px]"
          >
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Events · In 3 days
            </div>
            <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
              Tech Fest 2025 — Register by Friday
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
              <span>48 going</span>
              <span>Main Auditorium</span>
            </div>
          </motion.div>

          <motion.div
            variants={rightItem}
            className="rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-[13px] py-[11px]"
          >
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              Collaboration · 2/4 slots
            </div>
            <div className="mt-1.5 text-[12px] font-medium leading-snug text-white">
              Teammates needed for HackIndia 2025
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {['Python', 'ML', 'UI/UX'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-[4px] bg-[var(--bg-panel)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
