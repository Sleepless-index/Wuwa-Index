import { useTrackerStore } from '@/store/trackerStore';
import { useCollapse } from '@/hooks/useCollapse';
import { EL_COLORS } from '@/data/resonators';
import { useRef } from 'react';

export default function PriorityList() {
  const priority          = useTrackerStore(s => s.priority);
  const versions          = useTrackerStore(s => s.versions);
  const upcoming          = useTrackerStore(s => s.upcoming);
  const removeFromPriority = useTrackerStore(s => s.removeFromPriority);
  const reorderPriority    = useTrackerStore(s => s.reorderPriority);
  const { open, toggle, bodyRef } = useCollapse(true);

  const allEntries = versions.flatMap(g => g.entries);
  const entryMap   = Object.fromEntries(allEntries.map(e => [e.id, e]));

  const dragSrc = useRef<number | null>(null);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
      {/* Heading */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface2 transition-colors"
      >
        <span className="text-xs font-semibold text-wish font-mono tracking-wide">★ Pull Priority</span>
        <span className={`text-subtext text-xs transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▼</span>
      </button>

      {/* Body */}
      <div
        ref={bodyRef}
        className="section-body overflow-hidden transition-[max-height] duration-250"
        style={{ maxHeight: open ? 'none' : '0' }}
      >
        <div className="px-3 pb-3">
          {priority.length === 0 ? (
            <p className="text-xs text-subtext font-mono px-1 py-2">
              No resonators prioritized — tap P on any unowned resonator to add one.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {priority.map((id, idx) => {
                const entry    = entryMap[id];
                const upEntry  = upcoming.find(u => u.uid === id);
                const name     = entry?.name ?? upEntry?.name ?? '?';
                const element  = entry?.element ?? upEntry?.element ?? '';
                const color    = element ? EL_COLORS[element] : undefined;
                const isUp     = !!upEntry && !entry;

                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => { dragSrc.current = id; }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragSrc.current !== null && dragSrc.current !== id) {
                        reorderPriority(dragSrc.current, id);
                      }
                      dragSrc.current = null;
                    }}
                    className="
                      flex items-center gap-2 px-2.5 py-2 rounded-lg
                      bg-surface2 border border-border
                      hover:border-subtext transition-colors cursor-grab active:cursor-grabbing
                    "
                  >
                    <span className="text-subtext text-sm select-none">⠿</span>
                    <span className="text-[10px] font-mono text-subtext w-6 shrink-0">#{idx + 1}</span>
                    <span className="text-sm font-medium text-text flex-1 truncate">{name}</span>
                    {element && (
                      <span
                        className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded"
                        style={{ color, background: `${color}18` }}
                      >
                        {element}
                      </span>
                    )}
                    {isUp && (
                      <span className="text-[9px] font-mono text-upcoming bg-upcoming/10 px-1.5 py-0.5 rounded">
                        upcoming
                      </span>
                    )}
                    <button
                      onClick={() => removeFromPriority(id)}
                      className="text-subtext hover:text-havoc text-xs ml-1 transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
