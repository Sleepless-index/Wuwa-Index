import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function FilterBar() {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border overflow-x-auto flex-shrink-0">
      {/* All pill */}
      <button
        onClick={() => setFilter('All')}
        className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all"
        style={{
          background:  filter === 'All' ? 'rgba(255,255,255,0.12)' : 'transparent',
          borderColor: filter === 'All' ? 'rgba(255,255,255,0.35)' : 'var(--border)',
          color:       filter === 'All' ? '#fff' : 'var(--subtext)',
        }}
      >
        All
      </button>

      {/* Element pills */}
      {EL_ORDER.map(el => {
        const color  = EL_COLORS[el];
        const active = filter === el;
        return (
          <button
            key={el}
            onClick={() => setFilter(active ? 'All' : el)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all"
            style={{
              background:  active ? `${color}18` : 'transparent',
              borderColor: active ? color         : 'var(--border)',
              color:       active ? color         : 'var(--subtext)',
            }}
          >
            <img
              src={`icons/icon_${el}.webp`}
              alt=""
              className="w-3.5 h-3.5 object-contain"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            {el}
          </button>
        );
      })}
    </div>
  );
}
