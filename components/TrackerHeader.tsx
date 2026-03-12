import type { ModalType, SidebarTab } from '@/types';

interface Props {
  onOpen:  (m: ModalType) => void;
  onReset: () => void;
  tab:     SidebarTab;
}

const TAB_LABELS: Record<SidebarTab, string> = {
  characters:  'Characters',
  weapons:     'Weapons',
  priority:    'Priority',
  leaderboard: 'Gacha Cost',
};

export default function TrackerHeader({ onOpen, onReset, tab }: Props) {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {/* Tab title */}
      <h1 className="text-sm font-semibold truncate flex-1 min-w-0" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
        {TAB_LABELS[tab]}
      </h1>

      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Snapshot — hidden on leaderboard */}
        {tab !== 'leaderboard' && (
          <button
          onClick={() => onOpen(tab === 'weapons' ? 'weapon-snapshot' : 'snapshot')}
          title="Snapshot"
          className="h-7 px-2.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-all"
          style={{ borderColor: 'rgba(76,123,214,0.25)', color: 'rgba(76,123,214,0.7)', background: 'rgba(76,123,214,0.05)' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(76,123,214,0.5)'; el.style.color = '#4c7bd6'; el.style.background = 'rgba(76,123,214,0.1)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(76,123,214,0.25)'; el.style.color = 'rgba(76,123,214,0.7)'; el.style.background = 'rgba(76,123,214,0.05)'; }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          snapshot
        </button>
        )}

        {/* Reset — icon only, danger */}
        <button
          onClick={onReset}
          title="Reset All"
          className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--subtext)', background: 'transparent' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(244,114,182,0.4)'; el.style.color = '#f472b6'; el.style.background = 'rgba(244,114,182,0.05)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--subtext)'; el.style.background = 'transparent'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
