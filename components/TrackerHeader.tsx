import type { ModalType } from '@/types';
import { EL_COLORS } from '@/data/resonators';

interface Props {
  onOpen:       (m: ModalType) => void;
  onReset:      () => void;
  onOpenFilter: () => void;
  activeFilter: string;
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

export default function TrackerHeader({ onOpen, onReset, onOpenFilter, activeFilter }: Props) {
  const filterColor = activeFilter !== 'All' ? EL_COLORS[activeFilter] : undefined;

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

      {/* Row 2: filter button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenFilter}
          className="flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all flex-shrink-0"
          style={{
            background:  filterColor ? `${filterColor}14` : 'transparent',
            borderColor: filterColor ? filterColor         : 'var(--border)',
            color:       filterColor ? filterColor         : 'var(--subtext)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {activeFilter !== 'All' ? activeFilter : 'filter'}
        </button>
      </div>
    </div>
  );
}
