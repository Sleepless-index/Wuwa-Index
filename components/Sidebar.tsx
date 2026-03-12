import type { ReactNode } from 'react';
import type { ModalType, SidebarTab } from '@/types';

interface Props {
  tab:    SidebarTab;
  setTab: (t: SidebarTab) => void;
  onOpen: (m: ModalType) => void;
}

type NavItem = { id: SidebarTab; title: string } & (
  | { kind: 'img';    src: string }
  | { kind: 'lucide'; icon: (active: boolean) => ReactNode }
);

const NAV: NavItem[] = [
  { id: 'characters',  kind: 'img',    src:  'icons/bt_iconcharacter.webp', title: 'Characters'   },
  { id: 'weapons',     kind: 'img',    src:  'icons/bt_iconweapon.webp',    title: 'Weapons'      },
  { id: 'priority',    kind: 'lucide', icon: (a) => (
      <svg width="18" height="18" viewBox="0 0 24 24"
        fill={a ? 'rgba(76,123,214,0.8)' : 'none'}
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: a ? 1 : 0.35, filter: a ? 'drop-shadow(0 0 4px rgba(76,123,214,0.4))' : 'none' }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ), title: 'Priority' },
  { id: 'leaderboard', kind: 'lucide', icon: (a) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="icons/T_IconA_zcpq_UI.webp" alt="" width={22} height={22}
        className="object-contain"
        style={{ opacity: a ? 1 : 0.35, filter: a ? 'drop-shadow(0 0 4px rgba(76,123,214,0.4))' : 'none' }}
        onError={e => (e.currentTarget.style.display = 'none')} />
    ), title: 'Gacha Cost' },
];

export default function Sidebar({ tab, setTab, onOpen }: Props) {
  return (
    <div className="flex flex-col items-center py-4 gap-2 w-full h-full">

      {/* Logo mark */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1 flex-shrink-0"
        style={{ background: 'rgba(76,123,214,0.06)', border: '1px solid rgba(76,123,214,0.15)' }}>
        <span className="text-[10px] font-mono font-bold" style={{ color: 'rgba(76,123,214,0.7)', letterSpacing: '0.05em' }}>WW</span>
      </div>

      {/* Separator */}
      <div className="w-6 h-px mb-1 flex-shrink-0" style={{ background: 'var(--border)' }} />

      {/* Nav icons */}
      {NAV.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            title={item.title}
            onClick={() => setTab(item.id)}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0"
            style={{
              background: active ? 'rgba(76,123,214,0.1)'          : 'transparent',
              border:     active ? '1px solid rgba(76,123,214,0.35)' : '1px solid transparent',
              boxShadow:  active ? '0 0 16px rgba(76,123,214,0.1)'  : 'none',
              color:      active ? '#4c7bd6' : 'var(--subtext)',
            }}
          >
            {/* Active left bar */}
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                style={{ background: 'rgba(76,123,214,0.7)' }} />
            )}

            {item.kind === 'img' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.title}
                className="w-5 h-5 object-contain transition-opacity duration-150"
                style={{ opacity: active ? 1 : 0.35, filter: active ? 'drop-shadow(0 0 4px rgba(76,123,214,0.4))' : 'none' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              item.icon(active)
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      {/* Separator */}
      <div className="w-6 h-px mb-1 flex-shrink-0" style={{ background: 'var(--border)' }} />

      {/* Import */}
      <button title="Import" onClick={() => onOpen('import')}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 group"
        style={{ color: 'var(--subtext)', border: '1px solid transparent' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--subtext)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </button>

      {/* Export */}
      <button title="Export" onClick={() => onOpen('export')}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
        style={{ color: 'var(--subtext)', border: '1px solid transparent' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--subtext)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    </div>
  );
}
