'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import type { MockPost } from '@/lib/mock/posts';

interface MediaBlockProps {
  media?: MockPost['media'];
  /** feed cards cap at 340px; the post detail page gets more room (500px). */
  variant?: 'feed' | 'detail';
}

/**
 * Modern-Reddit-style hero media: full card width, never cropped or
 * stretched. The height is capped (340/500px) and floored (140px, so a
 * short/wide image doesn't look tiny) but otherwise follows the image's own
 * aspect ratio — object-contain scales the actual pixels to fit inside
 * that box, letterboxing on whichever axis has slack against the
 * background color rather than cropping (cover) or distorting (fill).
 * Drive links deliberately don't get this treatment — they're not a
 * visual asset, so the compact file-icon card elsewhere is enough.
 */
export default function MediaBlock({ media, variant = 'feed' }: MediaBlockProps) {
  const [playing, setPlaying] = useState(false);

  if (!media || media.length === 0) return null;

  const image = media.find((m) => m.type === 'image');
  const youtube = media.find((m) => m.type === 'youtube');
  const maxHeightClass = variant === 'detail' ? 'max-h-[500px]' : 'max-h-[340px]';

  if (image) {
    return (
      <div className="mt-2 flex w-full items-center justify-center overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)] bg-[var(--bg-page)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt=""
          className={`w-full min-h-[140px] ${maxHeightClass} object-contain`}
        />
      </div>
    );
  }

  if (youtube?.providerId) {
    if (playing) {
      return (
        <div
          className={`mt-2 w-full overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)] ${maxHeightClass}`}
        >
          <div className="relative aspect-video w-full max-w-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtube.providerId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setPlaying(true);
        }}
        aria-label="Play video"
        className="relative mt-2 flex w-full items-center justify-center overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)] bg-[var(--bg-page)]"
      >
        {youtube.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtube.thumbnailUrl}
            alt="YouTube video thumbnail"
            className={`w-full min-h-[140px] ${maxHeightClass} object-contain`}
          />
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/60">
            <Play className="h-5 w-5 fill-white text-white" />
          </span>
        </span>
      </button>
    );
  }

  return null;
}
