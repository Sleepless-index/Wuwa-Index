import { useRef, useState, useEffect } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

export default function FilterPopover() {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filterColor = filter !== 'All' ? EL_COLORS[filter] : undefined;

  const handleSelect = (el: string) => {
    setFilter(filter === el ? 'All' : el);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2 mb-4" ref={ref}>
      {/* Filter trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all flex-shrink-0"
        style={{
          background:  filterColor ? `${filterColor}14` : open ? 'var(--surface2)' : 'transparent',
          borderColor: filterColor ? filterColor         : open ? 'var(--subtext)'  : 'var(--border)',
          color:       filterColor ? filterColor         : open ? 'var(--text)'     : 'var(--subtext)',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        {filter !== 'All' ? filter : 'filter'}
      </button>

      {/* Inline element pills */}
      {open && (
        <div className="flex items-center gap-1.5" style={{ animation: 'fadeSlideIn 0.15s ease' }}>
          {EL_ORDER.map(el => {
            const color  = EL_COLORS[el];
            const active = filter === el;
            return (
              <button
                key={el}
                onClick={() => handleSelect(el)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg border transition-all flex-shrink-0 text-[11px] font-mono font-semibold"
                style={{
                  background:  active ? `${color}18` : 'var(--surface2)',
                  borderColor: active ? color        : 'var(--border)',
                  color:       active ? color        : 'var(--subtext)',
                }}
                title={el}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`icons/icon_${el}.webp`}
                  alt=""
                  className="w-3.5 h-3.5 object-contain flex-shrink-0"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <span className="hidden sm:inline">{el}</span>
              </button>
            );
          })}
          {filter !== 'All' && (
            <button
              onClick={() => { setFilter('All'); setOpen(false); }}
              className="text-[10px] font-mono text-subtext hover:text-text px-1.5 py-1 rounded border border-transparent hover:border-border transition-all flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
