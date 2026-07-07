interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  src?: string | null;
}

export default function Avatar({ initials, color, size = 32, src }: AvatarProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={initials}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-medium text-white"
          style={{ backgroundColor: color, fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
