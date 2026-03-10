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

  return (
    <div className="px-4 py-4">
      <p className="text-[11px] font-mono font-semibold text-wish uppercase tracking-widest mb-4">
        ★ Pull Priority
      </p>

      {priority.length === 0 ? (
        <p className="text-xs text-subtext font-mono">
          No resonators prioritized — tap P on any unowned card to add one.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 max-w-md">
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border hover:border-subtext transition-colors cursor-grab active:cursor-grabbing"
              >
                <span className="text-subtext text-sm select-none flex-shrink-0">⠿</span>
                <span className="text-[10px] font-mono text-subtext w-5 shrink-0">#{idx + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`icons/head_${slug}.webp`}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  style={{ border: color ? `1px solid ${color}55` : '1px solid var(--border)' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <span className="text-sm font-medium text-text flex-1 min-w-0 truncate">{name}</span>
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
      )}
    </div>
  );
}
