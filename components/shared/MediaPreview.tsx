import { Play, FileText } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';

interface MediaPreviewProps {
  media?: MockPost['media'];
}

/**
 * Compact media preview for generic card views (PostCard, used by the home
 * feed, discussion pages, and every profile post list — none of which
 * render the full sanitized body HTML, only a stripped text excerpt, so a
 * pasted YouTube/Drive embed or uploaded image was otherwise invisible
 * outside the composer and the full post-detail page).
 */
export default function MediaPreview({ media }: MediaPreviewProps) {
  if (!media || media.length === 0) return null;

  const image = media.find((m) => m.type === 'image');
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image.url} alt="" className="mt-2 max-h-[160px] w-full rounded-[9px] object-cover" />
    );
  }

  const youtube = media.find((m) => m.type === 'youtube');
  if (youtube?.thumbnailUrl) {
    return (
      <div className="relative mt-2 overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={youtube.thumbnailUrl} alt="YouTube video thumbnail" className="max-h-[160px] w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>
        </div>
      </div>
    );
  }

  const drive = media.find((m) => m.type === 'drive');
  if (drive) {
    return (
      <a
        href={drive.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="mt-2 flex items-center gap-2 rounded-[9px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] p-2.5 text-[11px] font-medium text-[var(--accent)] transition-colors hover:border-[var(--border-med)]"
      >
        <FileText className="h-4 w-4 shrink-0" />
        Open in Google Drive
      </a>
    );
  }

  return null;
}
