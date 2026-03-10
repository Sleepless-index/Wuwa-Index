import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function FilterBar() {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  return (
    <div className="grid grid-cols-6 gap-1.5 px-4 py-2.5 border-b border-border flex-shrink-0">
      {EL_ORDER.map(el => {
        const color  = EL_COLORS[el];
        const active = filter === el;
        return (
          <button
            key={el}
            onClick={() => setFilter(active ? 'All' : el)}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all"
            style={{
              background:  active ? `${color}18` : 'transparent',
              borderColor: active ? color         : 'var(--border)',
              color:       active ? color         : 'var(--subtext)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${el}.webp`}
              alt=""
              className="w-3.5 h-3.5 object-contain flex-shrink-0"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <span className="truncate">{el}</span>
          </button>
        );
      })}
    </div>
  );
}
