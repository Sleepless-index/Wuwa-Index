import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function FilterPopover() {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  return (
    <div className="flex items-center gap-1.5 mb-5 flex-wrap">
      {EL_ORDER.map(el => {
        const color  = EL_COLORS[el];
        const active = filter === el;
        return (
          <button
            key={el}
            onClick={() => setFilter(active ? 'All' : el)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all"
            style={{
              background:  active ? `${color}18` : 'transparent',
              borderColor: active ? color        : 'var(--border)',
              color:       active ? color        : 'var(--subtext)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${el}.webp`}
              alt={el}
              className="w-3.5 h-3.5 object-contain flex-shrink-0"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            {el}
          </button>
        );
      })}
      {filter !== 'All' && (
        <button
          onClick={() => setFilter('All')}
          className="text-[10px] font-mono text-subtext hover:text-text px-1.5 py-1 rounded border border-transparent hover:border-border transition-all"
        >✕</button>
      )}
    </div>
  );
}
