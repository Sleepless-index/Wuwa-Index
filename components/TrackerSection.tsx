import { useTrackerStore } from '@/store/trackerStore';
import TrackerEntry from './TrackerEntry';
import type { VersionGroup } from '@/types';

interface Props { group: VersionGroup; }

export default function TrackerSection({ group }: Props) {
  const stateMap = useTrackerStore(s => s.state);
  const filter   = useTrackerStore(s => s.activeFilter);

  const visibleEntries = group.entries.filter(e =>
    filter === 'All' || e.element === filter
  );
  if (visibleEntries.length === 0) return null;

  const got   = group.entries.filter(e => stateMap[e.id]?.res).length;
  const total = group.entries.length;
  const pct   = total > 0 ? got / total : 0;

  return (
    <div className="mb-7">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Accent pip */}
        <span className="w-1 h-3 rounded-full flex-shrink-0"
          style={{ background: pct === 1 ? 'rgba(137,217,160,0.7)' : 'rgba(245,216,138,0.35)' }} />

        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase flex-1"
          style={{ color: 'var(--subtext)' }}>
          {group.label}
        </span>

        {/* Progress: fraction + mini bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct * 100}%`, background: pct === 1 ? 'rgba(137,217,160,0.6)' : 'rgba(245,216,138,0.45)' }} />
          </div>
          <span className="text-[9px] font-mono tabular-nums" style={{ color: 'var(--muted)' }}>
            {got}/{total}
          </span>
        </div>
      </div>

      <div className="card-grid flex flex-wrap gap-2">
        {visibleEntries.map(e => (
          <TrackerEntry key={e.id} entry={e} />
        ))}
      </div>
    </div>
  );
}
