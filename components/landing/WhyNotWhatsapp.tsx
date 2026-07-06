'use client';

import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa6';
import { HiXMark, HiCheck, HiOutlineAcademicCap } from 'react-icons/hi2';
import { PLATFORM_NAME } from '@/lib/constants';

const WHATSAPP_ISSUES = [
  'Messages scroll away and get lost',
  'No way to search old answers',
  'Anyone can join and spam',
  'No upvoting or best answers',
  '256 member limit',
  'No file organisation',
];

const PLATFORM_BENEFITS = [
  'Searchable posts that stay forever',
  'Accepted answers rise to the top',
  'Verified college students only',
  'Best answers float up automatically',
  'Unlimited members',
  'Resources section for organised files',
];

const cardLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const cardRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function WhyNotWhatsapp() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="overflow-hidden px-6 py-14 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">
          Why not just use WhatsApp groups?
        </h2>
        <p className="mb-8 mt-1.5 text-[13px] text-[var(--text-secondary)]">
          WhatsApp groups lose everything. {PLATFORM_NAME} keeps it searchable forever.
        </p>

        <div ref={ref} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* WhatsApp — the problem */}
          <motion.div
            variants={cardLeft}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded-[16px] border-[0.5px] border-[var(--border)] bg-[#161929] p-6 transition-[border-color,box-shadow] duration-300 hover:border-[var(--danger-border)] hover:shadow-[0_10px_30px_-14px_rgba(220,53,69,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[rgba(37,211,102,0.12)] text-[#25D366]">
                <FaWhatsapp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">WhatsApp groups</div>
                <div className="text-[11px] text-[var(--text-muted)]">The chaotic status quo</div>
              </div>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {WHATSAPP_ISSUES.map((issue) => (
                <li key={issue} className="flex items-center gap-2.5 text-[12px] text-[var(--text-secondary)]">
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--danger-dim)] text-[var(--danger)]">
                    <HiXMark className="h-3 w-3" />
                  </span>
                  {issue}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Campus Thread — the fix */}
          <motion.div
            variants={cardRight}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded-[16px] border-[0.5px] border-[var(--success-border)] bg-[#161929] p-6 transition-[border-color,box-shadow] duration-300 hover:border-[var(--success)] hover:shadow-[0_0_0_1px_var(--success-border),0_10px_30px_-14px_rgba(29,184,116,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--success-dim)] text-[var(--success)]">
                <HiOutlineAcademicCap className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-white">{PLATFORM_NAME}</div>
                <div className="text-[11px] text-[var(--text-muted)]">Built for campus life</div>
              </div>
            </div>

            <ul className="mt-5 flex flex-col gap-3">
              {PLATFORM_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-[12px] text-[var(--text-secondary)]">
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--success-dim)] text-[var(--success)]">
                    <HiCheck className="h-3 w-3" />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
