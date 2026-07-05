'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { COLLEGE_NAME, PLATFORM_NAME } from '@/lib/constants';

export default function LandingNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 flex h-[52px] items-center justify-between border-b-[0.5px] border-[var(--border)] px-6 transition-colors duration-300 ${
        scrolled ? 'bg-[rgba(18,21,31,0.85)] backdrop-blur-md' : 'bg-[var(--bg-surface)]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt={PLATFORM_NAME} className="h-8 w-auto shrink-0" />
        <div className="flex flex-col leading-none">
          <span className="text-[13px] font-medium text-[var(--text-primary)]">{PLATFORM_NAME}</span>
          <span className="hidden text-[10px] text-[var(--text-muted)] sm:block">{COLLEGE_NAME}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/login')}
          className="rounded-[8px] border-[0.5px] border-[var(--border-med)] bg-transparent px-3.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          Log in
        </button>
        <button
          onClick={() => router.push('/login')}
          className="rounded-[8px] bg-[var(--accent-fill)] px-3.5 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Join free
        </button>
      </div>
    </motion.header>
  );
}
