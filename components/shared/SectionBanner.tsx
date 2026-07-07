'use client';

import {
  Megaphone,
  CalendarClock,
  BookOpen,
  MapPin,
  Users,
  EyeOff,
  School,
  ClipboardList,
  Briefcase,
  Building2,
  Code2,
  Laptop,
  Home,
  PartyPopper,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';
import { SECTION_META } from '@/lib/constants';
import { cn } from '@/lib/utils';

// This codebase renders icons with lucide-react (see lib/icon-map.tsx), not a
// Tabler webfont — so the SECTION_META `icon` strings are resolved to lucide
// components here rather than emitted as `ti ti-*` classes.
const SECTION_ICONS: Record<string, LucideIcon> = {
  speakerphone: Megaphone,
  'calendar-event': CalendarClock,
  books: BookOpen,
  'map-pin': MapPin,
  users: Users,
  'eye-off': EyeOff,
  school: School,
  'clipboard-list': ClipboardList,
  briefcase: Briefcase,
  'building-factory': Building2,
  code: Code2,
  'device-laptop': Laptop,
  home: Home,
  confetti: PartyPopper,
  messages: MessagesSquare,
};

interface SectionBannerProps {
  slug: string;
  title: string;
  className?: string;
}

export function SectionBanner({ slug, title, className }: SectionBannerProps) {
  const meta = SECTION_META[slug];
  if (!meta) return null;

  const Icon = SECTION_ICONS[meta.icon];

  return (
    <div
      className={cn(
        'mb-4 flex items-start gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-[13px]',
        className,
      )}
    >
      <div
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] border"
        style={{ backgroundColor: `${meta.color}1A`, borderColor: meta.borderColor }}
      >
        {Icon && <Icon className="h-[17px] w-[17px]" style={{ color: meta.color }} aria-hidden="true" />}
      </div>
      <div>
        <p className="mb-[3px] text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[12px] leading-relaxed text-[var(--text-secondary)]">{meta.description}</p>
      </div>
    </div>
  );
}
