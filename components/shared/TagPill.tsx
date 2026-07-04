export default function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]">
      {label}
    </span>
  );
}
