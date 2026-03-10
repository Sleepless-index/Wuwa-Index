import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function ElementBreakdown() {
  const stateMap  = useTrackerStore(s => s.state);
  const versions  = useTrackerStore(s => s.versions);
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);
  const allEntries = versions.flatMap(g => g.entries);

  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {EL_ORDER.map(el => {
        const color  = EL_COLORS[el];
        const entries = allEntries.filter(e => e.element === el);
        const got    = entries.filter(e => stateMap[e.id]?.res).length;
        const total  = entries.length;
        const pct    = total ? Math.round((got / total) * 100) : 0;
        const active = filter === el;
        const faded  = filter !== 'All' && !active;

        return (
          <button
            key={el}
            onClick={() => setFilter(active ? 'All' : el)}
            title={`Filter: ${el}`}
            className="relative flex-shrink-0 flex flex-col items-center rounded-xl p-2 transition-all duration-150 cursor-pointer border"
            style={{
              width: 52,
              background: active ? `${color}14` : 'var(--surface)',
              borderColor: active ? color : 'var(--border)',
              opacity: faded ? 0.35 : 1,
              boxShadow: active ? `0 0 8px ${color}30` : 'none',
            }}
          >
            {/* Element icon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${el}.webp`}
              alt={el}
              className="w-6 h-6 object-contain mb-1"
              onError={e => (e.currentTarget.style.display = 'none')}
            />

            {/* Count */}
            <span className="text-[10px] font-mono font-semibold leading-none" style={{ color }}>
              {got}/{total}
            </span>

            {/* Mini progress bar */}
            <div className="w-full h-0.5 bg-border rounded-full overflow-hidden mt-1.5">
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
