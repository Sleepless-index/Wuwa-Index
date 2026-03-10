import type { ModalType } from '@/types';

interface Props {
  onOpen:  (m: ModalType) => void;
  onReset: () => void;
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
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
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
  );
}
