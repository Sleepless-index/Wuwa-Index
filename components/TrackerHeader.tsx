import type { ModalType } from '@/types';

interface Props {
  allOpen:     boolean;
  onToggleAll: () => void;
  onOpen:      (m: ModalType) => void;
  onReset:     () => void;
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
      w-8 h-8 rounded-lg border border-border bg-transparent flex items-center justify-center
      transition-all flex-shrink-0
      ${danger
        ? 'text-subtext hover:text-havoc hover:border-havoc hover:bg-havoc/5'
        : 'text-subtext hover:text-sig   hover:border-sig   hover:bg-sig/5'}
    `}
  >
    {children}
  </button>
);

export default function TrackerHeader({ allOpen, onToggleAll, onOpen, onReset }: Props) {
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        {/* Export */}
        <HdrBtn title="Export" onClick={() => onOpen('export')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </HdrBtn>

        {/* Import */}
        <HdrBtn title="Import" onClick={() => onOpen('import')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </HdrBtn>

        {/* Snapshot */}
        <HdrBtn title="Snapshot" onClick={() => onOpen('snapshot')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </HdrBtn>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* Reset */}
        <HdrBtn title="Reset All" onClick={onReset} danger>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </HdrBtn>
      </div>

      {/* Collapse / expand all */}
      <button
        onClick={onToggleAll}
        className="
          ml-auto text-[11px] font-mono text-subtext border border-border
          rounded-md px-2.5 py-1 hover:border-subtext hover:text-text transition-all
        "
      >
        {allOpen ? 'collapse all' : 'expand all'}
      </button>
    </div>
  );
}
