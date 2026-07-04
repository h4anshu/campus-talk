'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden bg-[#0D1525] px-6 py-14 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(29,78,216,0.15)_0%,transparent_60%)]" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-[560px]"
      >
        <h2 className="text-[24px] font-medium text-white">
          Ready to join your campus community?
        </h2>
        <p className="mb-6 mt-2 text-[13px] text-[rgba(255,255,255,0.6)]">
          Free forever for students. No ads. No outsiders. Just your college.
        </p>

        <Link
          href="/login"
          className="mx-auto flex w-full items-center justify-center gap-2 rounded bg-[var(--accent-fill)] px-6 py-[11px] text-[13px] font-medium text-white transition-opacity hover:opacity-90 sm:w-fit"
        >
          <Mail className="h-4 w-4" />
          Join with your college email
        </Link>

        <p className="mt-3 text-[11px] text-[rgba(255,255,255,0.4)]">
          Already a member?{' '}
          <Link href="/login" className="underline hover:text-[rgba(255,255,255,0.6)]">
            Log in here
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
