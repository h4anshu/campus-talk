interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
  online?: boolean;
}

export default function Avatar({ initials, color, size = 32, online = false }: AvatarProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="flex h-full w-full items-center justify-center rounded-full font-medium text-white"
        style={{ backgroundColor: color, fontSize: size * 0.38 }}
      >
        {initials}
      </div>
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--success)]"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </div>
  );
}
