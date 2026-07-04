import { SORT_OPTIONS, type SortOption } from '@/lib/constants';

interface SortBarProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortBar({ value, onChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-1.5">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`rounded px-3 py-1.5 text-[12px] font-medium transition-colors ${
            value === option
              ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-secondary)]'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
