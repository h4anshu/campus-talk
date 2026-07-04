'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface YoutubeEmbedProps {
  videoId: string;
  thumbnailUrl?: string;
}

/** Detail-page embed — starts as a thumbnail + play button (cheap, no iframe
 * cost until the viewer actually wants to watch), swaps to the real player
 * on click. Capped at 500px, same containment approach as MediaBlock. */
export default function YoutubeEmbed({ videoId, thumbnailUrl }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="mt-3 w-full max-h-[500px] overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)]">
        <div className="relative aspect-video w-full max-w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
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
      className="relative mt-3 flex w-full items-center justify-center overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)] bg-[var(--bg-page)]"
    >
      {thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt="YouTube video thumbnail"
          className="w-full min-h-[140px] max-h-[500px] object-contain"
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
