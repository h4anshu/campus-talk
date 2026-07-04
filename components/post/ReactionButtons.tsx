'use client';

import { useState } from 'react';
import { Heart, HeartHandshake } from 'lucide-react';

export default function ReactionButtons() {
  const [relate, setRelate] = useState<{ active: boolean; count: number }>({
    active: false,
    count: 41,
  });
  const [support, setSupport] = useState<{ active: boolean; count: number }>({
    active: false,
    count: 28,
  });

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="mt-2.5 flex items-center gap-2">
      <button
        onClick={(e) => {
          stop(e);
          setRelate((r) => ({ active: !r.active, count: r.active ? r.count - 1 : r.count + 1 }));
        }}
        className={`flex items-center gap-1.5 rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
          relate.active
            ? 'border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)]'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
        }`}
      >
        <Heart className="h-3.5 w-3.5" fill={relate.active ? 'var(--danger)' : 'none'} />
        Relate · {relate.count}
      </button>

      <button
        onClick={(e) => {
          stop(e);
          setSupport((s) => ({ active: !s.active, count: s.active ? s.count - 1 : s.count + 1 }));
        }}
        className={`flex items-center gap-1.5 rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
          support.active
            ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
        }`}
      >
        <HeartHandshake className="h-3.5 w-3.5" />
        Support · {support.count}
      </button>
    </div>
  );
}
