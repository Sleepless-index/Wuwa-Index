import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

export default function PriorityPanel() {
  const priority           = useTrackerStore(s => s.priority);
  const versions           = useTrackerStore(s => s.versions);
  const upcoming           = useTrackerStore(s => s.upcoming);
  const removeFromPriority = useTrackerStore(s => s.removeFromPriority);
  const reorderPriority    = useTrackerStore(s => s.reorderPriority);
  const allEntries         = versions.flatMap(g => g.entries);
  const entryMap           = Object.fromEntries(allEntries.map(e => [e.id, e]));
  const [dragSrc, setDragSrc] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  if (priority.length === 0) {
    return (
      <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[200px] gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(245,216,138,0.06)', border: '1px solid rgba(245,216,138,0.12)' }}>
          <span className="text-lg" style={{ color: 'rgba(245,216,138,0.4)' }}>★</span>
        </div>
        <p className="text-xs font-mono text-center" style={{ color: 'var(--subtext)', maxWidth: 200 }}>
          Tap <span style={{ color: 'rgba(245,216,138,0.6)' }}>P</span> on any unowned character card to add it here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--subtext)' }}>
          Pull Priority
        </span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
          style={{ color: 'rgba(245,216,138,0.7)', background: 'rgba(245,216,138,0.08)', border: '1px solid rgba(245,216,138,0.15)' }}>
          {priority.length}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        {priority.map((id, idx) => {
          const entry   = entryMap[id];
          const upEntry = upcoming.find(u => u.uid === id);
          const name    = entry?.name ?? upEntry?.name ?? '?';
          const element = entry?.element ?? upEntry?.element ?? '';
          const color   = element ? EL_COLORS[element] : undefined;
          const isUp    = !!upEntry && !entry;
          const slug    = toImageSlug(name);
          const isDragging = dragSrc === id;
          const isTarget   = dragOver === id && dragSrc !== id;

          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDragSrc(id)}
              onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
              onDragOver={e => { e.preventDefault(); setDragOver(id); }}
              onDrop={() => {
                if (dragSrc !== null && dragSrc !== id) reorderPriority(dragSrc, id);
                setDragSrc(null); setDragOver(null);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all"
              style={{
                background:  isTarget ? 'rgba(245,216,138,0.06)' : color ? `${color}08` : 'var(--surface)',
                border:      isTarget
                  ? '1px solid rgba(245,216,138,0.35)'
                  : color ? `1px solid ${color}28` : '1px solid var(--border)',
                opacity:     isDragging ? 0.4 : 1,
                transform:   isTarget ? 'translateX(4px)' : 'none',
              }}
            >
              {/* Rank number */}
              <span className="text-[10px] font-mono font-bold w-5 text-center flex-shrink-0 tabular-nums"
                style={{ color: idx === 0 ? 'rgba(245,216,138,0.8)' : 'var(--muted)' }}>
                {idx === 0 ? '★' : idx + 1}
              </span>

              {/* Head icon with element ring */}
              <div className="relative flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`icons/head_${slug}.webp`}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover"
                  style={{
                    border: color ? `1.5px solid ${color}55` : '1.5px solid var(--border)',
                    boxShadow: color ? `0 0 8px ${color}22` : 'none',
                  }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                {color && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-bg flex-shrink-0"
                    style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                )}
              </div>

              {/* Name */}
              <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--text)' }}>
                {name}
              </span>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isUp && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{ color: 'var(--upcoming)', background: 'rgba(126,212,196,0.1)', border: '1px solid rgba(126,212,196,0.2)' }}>
                    upcoming
                  </span>
                )}
                {/* Drag handle */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--muted)', flexShrink: 0 }}>
                  <circle cx="9" cy="6" r="1.5" fill="currentColor"/>
                  <circle cx="15" cy="6" r="1.5" fill="currentColor"/>
                  <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="9" cy="18" r="1.5" fill="currentColor"/>
                  <circle cx="15" cy="18" r="1.5" fill="currentColor"/>
                </svg>
                {/* Remove */}
                <button
                  onClick={() => removeFromPriority(id)}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                  style={{ color: 'var(--muted)', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f472b6'; (e.currentTarget as HTMLElement).style.background = 'rgba(244,114,182,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
