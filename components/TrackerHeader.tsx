import { useRef, useState, useEffect } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';
import type { ModalType } from '@/types';

interface Props {
  onOpen:       (m: ModalType) => void;
  onReset:      () => void;
}

const HdrBtn = ({
  title, onClick, danger = false, children,
}: {
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      w-8 h-8 rounded-lg border bg-transparent flex items-center justify-center
      transition-all flex-shrink-0
      ${danger
        ? 'text-subtext hover:text-havoc hover:border-havoc hover:bg-havoc/5 border-border'
        : 'text-subtext hover:text-sig hover:border-sig hover:bg-sig/5 border-border'}
    `}
  >
    {children}
  </button>
);

export default function TrackerHeader({ onOpen, onReset }: Props) {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      {/* Row 1: action buttons */}
      <div className="flex items-center gap-1.5">
        <HdrBtn title="Export" onClick={() => onOpen('export')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </HdrBtn>
        <HdrBtn title="Import" onClick={() => onOpen('import')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </HdrBtn>
        <HdrBtn title="Snapshot" onClick={() => onOpen('snapshot')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </HdrBtn>
        <div className="w-px h-5 bg-border mx-0.5" />
        <HdrBtn title="Reset All" onClick={onReset} danger>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </HdrBtn>
      </div>

      {/* Row 2: filter button + inline popover */}
      <div className="flex items-center gap-2" ref={popoverRef}>
        {/* Filter trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all flex-shrink-0"
          style={{
            background:  filterColor ? `${filterColor}14` : open ? 'var(--surface2)' : 'transparent',
            borderColor: filterColor ? filterColor         : open ? 'var(--subtext)' : 'var(--border)',
            color:       filterColor ? filterColor         : open ? 'var(--text)'    : 'var(--subtext)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {filter !== 'All' ? filter : 'filter'}
        </button>

        {/* Inline element pills — slide in to the right */}
        {open && (
          <div className="flex items-center gap-1.5 animate-[fadeSlideIn_0.15s_ease]">
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
    </div>
  );
}
