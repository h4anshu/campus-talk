export default function YearBadge({ year }: { year: number }) {
  if (!year) return null;

  const suffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th';

  return (
    <span className="rounded-[4px] bg-[var(--bg-panel)] px-1.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
      {year}
      {suffix} Yr
    </span>
  );
}
