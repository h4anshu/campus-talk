import { Image as ImageIcon, PlayCircle, FileText } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';

interface MediaBadgeProps {
  media?: MockPost['media'];
}

const ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  youtube: PlayCircle,
  video: PlayCircle,
  drive: FileText,
};

const LABELS: Record<string, string> = {
  image: 'Photo',
  youtube: 'Video',
  video: 'Video',
  drive: 'File',
};

/**
 * Compact-card media indicator — icon + label only, never the actual
 * image/thumbnail. Full media (real images, playable embeds, Drive links)
 * only ever renders on the post detail page; the feed/list view is
 * title + a 2-line text preview + this badge, consistently across every
 * card type, per the Section 10 card spec.
 */
export default function MediaBadge({ media }: MediaBadgeProps) {
  if (!media || media.length === 0) return null;

  const types = Array.from(new Set(media.map((m) => m.type)));

  return (
    <>
      {types.map((type) => {
        const Icon = ICONS[type] ?? FileText;
        return (
          <span
            key={type}
            className="flex items-center gap-1 rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)]"
          >
            <Icon className="h-3 w-3" />
            {LABELS[type] ?? 'Attachment'}
          </span>
        );
      })}
    </>
  );
}
