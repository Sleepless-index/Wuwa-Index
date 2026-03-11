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

  return (
    <div className="mb-6">
      {/* Static section label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono font-bold tracking-[0.18em] uppercase whitespace-nowrap"
          style={{ color: 'var(--muted)' }}>
          {group.label}
        </span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--muted)', opacity: 0.6 }}>
          {got}/{total}
        </span>
      </div>

      <div className="card-grid flex flex-wrap gap-2">
        {visibleEntries.map(e => (
          <TrackerEntry key={e.id} entry={e} />
        ))}
      </div>
    </div>
  );
}
