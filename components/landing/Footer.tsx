'use client';

import Link from 'next/link';
import { scrollToId } from '@/lib/scroll';

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-6 py-5">
      <div className="text-[12px] text-[var(--text-muted)]">
        © 2025 CampusVoice — built for SITM College students
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => scrollToId('how-it-works')}
          className="text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          About
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          Privacy policy
        </button>
        <Link
          href="/login"
          className="text-[12px] text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
        >
          Contact admin
        </Link>
      </div>
    </footer>
  );
}
