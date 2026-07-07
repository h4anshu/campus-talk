'use client';

import { useState } from 'react';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface MediaItem {
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  providerId?: string | null;
}

interface MediaBlockProps {
  media?: MediaItem[];
  maxHeight?: number;
  className?: string;
}

export function MediaBlock({ media = [], maxHeight = 280, className = '' }: MediaBlockProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const images = media.filter((m) => m.type === 'image');
  const youtube = media.find((m) => m.type === 'youtube');

  if (images.length === 0 && !youtube) return null;

  return (
    <div className={className}>
      {images.length > 0 && (
        <div
          className="relative w-full rounded-[8px] overflow-hidden border-[0.5px] border-[var(--border)]"
          style={{ background: 'var(--bg-page)', maxHeight }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={optimizeCloudinaryUrl(images[0].url)}
            alt=""
            className="w-full"
            style={{ objectFit: 'contain', maxHeight, display: 'block' }}
          />
          {images.length > 1 && (
            <div
              className="absolute bottom-2 right-2 text-[11px] px-2 py-[2px] rounded-[4px]"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            >
              +{images.length - 1} more
            </div>
          )}
        </div>
      )}
      {!images.length && youtube && (
        <div
          className="relative w-full rounded-[8px] overflow-hidden border-[0.5px] border-[var(--border)]"
          style={{ background: '#000', maxHeight }}
        >
          {playingId === youtube.providerId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtube.providerId}?autoplay=1`}
              className="w-full"
              style={{ height: Math.min(maxHeight, 220), border: 0 }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div
              className="relative w-full cursor-pointer"
              style={{ height: Math.min(maxHeight, 220) }}
              onClick={(e) => {
                e.stopPropagation();
                setPlayingId(youtube.providerId ?? null);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtube.thumbnailUrl ?? `https://img.youtube.com/vi/${youtube.providerId}/hqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full"
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaBlock;
