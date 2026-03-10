import { useState, useEffect, useRef } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import TrackerEntry from './TrackerEntry';
import type { VersionGroup } from '@/types';

interface Props {
  group:      VersionGroup;
  forceOpen:  boolean;
  forceKey:   number;
}

export default function TrackerSection({ group, forceOpen, forceKey }: Props) {
  const [open, setOpen] = useState(true);
  const stateMap = useTrackerStore(s => s.state);
  const filter   = useTrackerStore(s => s.activeFilter);
  const bodyRef  = useRef<HTMLDivElement>(null);

  // Respond to collapse-all / expand-all signal from parent
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
    <div className="version-group mb-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="
          w-full flex items-center justify-between
          px-3 py-2 rounded-lg bg-surface2 border border-border
          hover:bg-surface hover:border-subtext/50 transition-all mb-1
        "
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text">{group.label}</span>
          <span className="text-[10px] font-mono text-subtext">{got}/{total}</span>
        </div>
        <span className={`text-subtext text-xs transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>
          ▼
        </span>
      </button>

      {open && (
        <div ref={bodyRef} className="flex flex-wrap gap-2 pt-1">
          {visibleEntries.map(e => (
            <TrackerEntry key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
