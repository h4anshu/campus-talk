import { FileText, ExternalLink } from 'lucide-react';

interface DriveCardProps {
  url: string;
}

export default function DriveCard({ url }: DriveCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-3 flex w-full max-w-full items-center gap-3 rounded-[9px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] p-3 transition-colors hover:border-[var(--border-med)]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border-[0.5px] border-[var(--accent-border)] bg-[var(--accent-dim)]">
        <FileText className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[var(--text-primary)]">
        Open in Google Drive
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
    </a>
  );
}
