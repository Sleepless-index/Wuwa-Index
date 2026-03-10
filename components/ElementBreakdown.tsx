import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function ElementBreakdown() {
  const stateMap   = useTrackerStore(s => s.state);
  const versions   = useTrackerStore(s => s.versions);
  const filter     = useTrackerStore(s => s.activeFilter);
  const setFilter  = useTrackerStore(s => s.setFilter);
  const allEntries = versions.flatMap(g => g.entries);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
      {EL_ORDER.map(el => {
        const color   = EL_COLORS[el];
        const entries = allEntries.filter(e => e.element === el);
        const got     = entries.filter(e => stateMap[e.id]?.res).length;
        const total   = entries.length;
        const pct     = total ? Math.round((got / total) * 100) : 0;
        const active  = filter === el;
        const faded   = filter !== 'All' && !active;

        return (
          <button
            key={el}
            onClick={() => setFilter(active ? 'All' : el)}
            title={`Filter by ${el}`}
            className={`
              relative bg-surface border rounded-xl p-2 text-left
              transition-all duration-150 overflow-hidden cursor-pointer
              ${active  ? 'border-[color:var(--border)] ring-1'   : 'border-border'}
              ${faded   ? 'opacity-40' : 'opacity-100'}
              hover:bg-surface2
            `}
            style={{ '--tw-ring-color': color } as React.CSSProperties}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />

            <div className="flex items-center gap-1.5 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`icons/icon_${el}.webp`}
                alt={el}
                className="w-4 h-4 object-contain"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <span className="text-[10px] font-semibold" style={{ color }}>{el}</span>
            </div>

            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs font-mono font-semibold text-text">{got}</span>
              <span className="text-[10px] font-mono text-subtext">/{total}</span>
            </div>

            {/* Mini progress bar */}
            <div className="h-0.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
