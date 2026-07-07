import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="h-6 w-6 text-[var(--text-muted)]" />
      <p className="text-[13px] font-medium text-[var(--text-secondary)]">{title}</p>
      {description && <p className="max-w-[280px] text-[11px] text-[var(--text-secondary)]">{description}</p>}
    </div>
  );
}
