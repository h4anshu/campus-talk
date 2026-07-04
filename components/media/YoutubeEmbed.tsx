interface YoutubeEmbedProps {
  videoId: string;
}

export default function YoutubeEmbed({ videoId }: YoutubeEmbedProps) {
  return (
    <div className="mt-3 w-full max-w-full overflow-hidden rounded-[9px] border-[0.5px] border-[var(--border)]">
      <div className="relative aspect-video w-full max-w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
