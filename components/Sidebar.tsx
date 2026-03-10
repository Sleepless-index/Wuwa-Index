import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';
import WeaponEntry from './WeaponEntry';
import type { ModalType, SidebarTab } from '@/types';

interface Props {
  onOpen: (m: ModalType) => void;
}

// ─── Pull Priority Panel ──────────────────────────────────────────────────────
function PriorityPanel() {
  const priority           = useTrackerStore(s => s.priority);
  const versions           = useTrackerStore(s => s.versions);
  const upcoming           = useTrackerStore(s => s.upcoming);
  const removeFromPriority = useTrackerStore(s => s.removeFromPriority);
  const reorderPriority    = useTrackerStore(s => s.reorderPriority);
  const allEntries         = versions.flatMap(g => g.entries);
  const entryMap           = Object.fromEntries(allEntries.map(e => [e.id, e]));

  const [dragSrc, setDragSrc] = useState<number | null>(null);

  if (priority.length === 0) return (
    <p className="text-xs text-subtext font-mono px-1 py-2">
      No resonators prioritized — tap P on any unowned card to add one.
    </p>
  );

  return (
    <div className="flex flex-col gap-1">
      {priority.map((id, idx) => {
        const entry   = entryMap[id];
        const upEntry = upcoming.find(u => u.uid === id);
        const name    = entry?.name ?? upEntry?.name ?? '?';
        const element = entry?.element ?? upEntry?.element ?? '';
        const color   = element ? EL_COLORS[element] : undefined;
        const isUp    = !!upEntry && !entry;
        const slug    = toImageSlug(name);

        return (
          <div
            key={id}
            draggable
            onDragStart={() => setDragSrc(id)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragSrc !== null && dragSrc !== id) reorderPriority(dragSrc, id);
              setDragSrc(null);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface2 border border-border hover:border-subtext transition-colors cursor-grab active:cursor-grabbing"
          >
            <span className="text-subtext text-sm select-none flex-shrink-0">⠿</span>
            <span className="text-[10px] font-mono text-subtext w-5 shrink-0">#{idx + 1}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/head_${slug}.webp`}
              alt=""
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              style={{ border: color ? `1px solid ${color}55` : '1px solid var(--border)' }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <span className="text-xs font-medium text-text flex-1 min-w-0 truncate">{name}</span>
            {isUp && (
              <span className="text-[9px] font-mono text-upcoming bg-upcoming/10 px-1.5 py-0.5 rounded flex-shrink-0">up</span>
            )}
            <button
              onClick={() => removeFromPriority(id)}
              className="text-subtext hover:text-havoc text-xs flex-shrink-0 transition-colors"
            >✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ onOpen }: Props) {
  const [tab, setTab]           = useState<SidebarTab>('characters');
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priority = useTrackerStore(s => s.priority);

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab buttons ── */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-4 flex-shrink-0">
        {(['characters', 'weapons'] as SidebarTab[]).map(t => {
          const icon  = t === 'characters' ? 'icons/bt_iconcharacter.webp' : 'icons/bt_iconweapon.webp';
          const label = t === 'characters' ? 'Characters' : 'Weapons';
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-[12px] font-mono font-semibold transition-all"
              style={{
                background:  active ? 'var(--surface2)' : 'transparent',
                borderColor: active ? 'var(--accent)'   : 'var(--border)',
                color:       active ? 'var(--accent)'   : 'var(--subtext)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={icon}
                alt=""
                className="w-5 h-5 object-contain"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Pull Priority button ── */}
      <div className="px-4 mb-3 flex-shrink-0">
        <button
          onClick={() => setPriorityOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all"
          style={{
            background:  priorityOpen ? 'var(--surface2)' : 'transparent',
            borderColor: priorityOpen ? 'var(--wish)'     : 'var(--border)',
            color:       priorityOpen ? 'var(--wish)'     : 'var(--subtext)',
          }}
        >
          <span className="text-[11px] font-mono font-semibold tracking-wide flex items-center gap-1.5">
            <span>★</span> Pull Priority
            {priority.length > 0 && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-mono ml-1"
                style={{ background: 'var(--wish)/15', color: 'var(--wish)' }}
              >
                {priority.length}
              </span>
            )}
          </span>
          <span className="text-xs transition-transform duration-200" style={{ transform: priorityOpen ? '' : 'rotate(-90deg)' }}>▼</span>
        </button>

        {priorityOpen && (
          <div className="mt-2">
            <PriorityPanel />
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
        {tab === 'characters' ? (
          <p className="text-xs text-subtext font-mono">
            {/* Characters tab — tracker is in the main content area */}
            Use the main area to manage your resonators.
          </p>
        ) : (
          <div>
            {/* Sig weapons */}
            <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-2">
              Signature Weapons
            </p>
            <div className="card-grid flex flex-wrap gap-2 mb-6">
              {SIG_WEAPONS.map(w => <WeaponEntry key={w.slug} weapon={w} />)}
            </div>

            {/* Standard weapons */}
            <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-2">
              Standard Weapons
            </p>
            <div className="card-grid flex flex-wrap gap-2">
              {STD_WEAPONS.map(w => <WeaponEntry key={w.slug} weapon={w} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── Import / Export at bottom ── */}
      <div className="flex-shrink-0 border-t border-border px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => onOpen('import')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-subtext hover:text-sig hover:border-sig transition-all text-[11px] font-mono font-semibold"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>
        <button
          onClick={() => onOpen('export')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-subtext hover:text-sig hover:border-sig transition-all text-[11px] font-mono font-semibold"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
