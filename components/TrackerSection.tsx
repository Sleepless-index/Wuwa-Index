import { useState, useEffect, useRef } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import TrackerEntry from './TrackerEntry';
import type { VersionGroup } from '@/types';

interface Props {
  group:     VersionGroup;
  forceOpen: boolean;
  forceKey:  number;
}

export default function TrackerSection({ group, forceOpen, forceKey }: Props) {
  const [open, setOpen] = useState(true);
  const stateMap = useTrackerStore(s => s.state);
  const filter   = useTrackerStore(s => s.activeFilter);
  const bodyRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(forceOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceKey]);

  const visibleEntries = group.entries.filter(e =>
    filter === 'All' || e.element === filter
  );
  if (visibleEntries.length === 0) return null;

  const got   = group.entries.filter(e => stateMap[e.id]?.res).length;
  const total = group.entries.length;

  return (
    <div className="mb-6">
      {/* ── Section divider header (image-2 style) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <span className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase whitespace-nowrap flex-shrink-0"
          style={{ color: 'var(--muted)' }}>
          {group.label}
        </span>
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          {got}/{total}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span
          className="text-[10px] flex-shrink-0 transition-transform duration-200"
          style={{ color: 'var(--muted)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          ▾
        </span>
      </button>

      {/* ── Cards grid ── */}
      {open && (
        <div ref={bodyRef} className="card-grid flex flex-wrap gap-2">
          {visibleEntries.map(e => (
            <TrackerEntry key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
