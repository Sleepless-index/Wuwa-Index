import type { ModalType, SidebarTab } from '@/types';

interface Props {
  tab:     SidebarTab;
  setTab:  (t: SidebarTab) => void;
  onOpen:  (m: ModalType) => void;
}

const NAV: { id: SidebarTab; icon: string; title: string }[] = [
  { id: 'characters', icon: 'icons/bt_iconcharacter.webp', title: 'Characters' },
  { id: 'weapons',    icon: 'icons/bt_iconweapon.webp',    title: 'Weapons'    },
  { id: 'priority',   icon: 'icons/bt_iconpriority.webp',  title: 'Priority'   },
];

export default function Sidebar({ tab, setTab, onOpen }: Props) {
  return (
    <div className="flex flex-col items-center py-4 gap-2 w-full h-full">
      {/* Nav icons */}
      {NAV.map(({ id, icon, title }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            title={title}
            onClick={() => setTab(id)}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
            style={{
              background:  active ? 'rgba(122,168,212,0.12)' : 'rgba(255,255,255,0.03)',
              border:      active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
              boxShadow:   active ? '0 0 14px rgba(122,168,212,0.18)' : 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={icon}
              alt={title}
              className="w-5 h-5 object-contain"
              style={{ opacity: active ? 1 : 0.45 }}
              onError={e => {
                // fallback text icon
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </button>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Import */}
      <button
        title="Import"
        onClick={() => onOpen('import')}
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--border)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </button>

      {/* Export */}
      <button
        title="Export"
        onClick={() => onOpen('export')}
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1.5px solid var(--border)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-subtext">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  );
}
