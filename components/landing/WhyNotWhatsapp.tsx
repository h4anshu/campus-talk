'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { X, Check } from 'lucide-react';

const WHATSAPP_ISSUES = [
  'Messages scroll away and get lost',
  'No way to search old answers',
  'Anyone can join and spam',
  'No upvoting or best answers',
  '256 member limit',
  'No file organisation',
];

const CAMPUSVOICE_BENEFITS = [
  'Searchable posts that stay forever',
  'Accepted answers rise to the top',
  'Verified college students only',
  'Best answers float up automatically',
  'Unlimited members',
  'Resources section for organised files',
];

export default function WhyNotWhatsapp() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="px-6 pb-12">
      <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
        Why not just use WhatsApp groups?
      </h2>
      <p className="mb-6 mt-1 text-[13px] text-[var(--text-secondary)]">
        WhatsApp groups lose everything. This platform keeps it searchable forever.
      </p>

      <div ref={ref} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-card border-[0.5px] border-[var(--danger-border)] bg-[var(--danger-dim)] p-4"
        >
          <div className="mb-3 text-[12px] font-medium text-[var(--danger)]">WhatsApp groups</div>
          <ul className="flex flex-col gap-2">
            {WHATSAPP_ISSUES.map((issue) => (
              <li
                key={issue}
                className="flex items-start gap-1.5 text-[11px] text-[var(--danger)] opacity-80"
              >
                <X className="mt-[1px] h-3 w-3 shrink-0" />
                {issue}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-card border-[0.5px] border-[var(--success-border)] bg-[var(--success-dim)] p-4"
        >
          <div className="mb-3 text-[12px] font-medium text-[var(--success)]">CampusVoice</div>
          <ul className="flex flex-col gap-2">
            {CAMPUSVOICE_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-1.5 text-[11px] text-[var(--success)] opacity-80"
              >
                <Check className="mt-[1px] h-3 w-3 shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
