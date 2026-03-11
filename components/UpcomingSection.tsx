import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { useCollapse } from '@/hooks/useCollapse';
import { EL_COLORS } from '@/data/resonators';
import type { ModalType } from '@/types';

const ELEMENTS = ['Spectro', 'Aero', 'Glacio', 'Fusion', 'Electro', 'Havoc'];

interface Props {
  onOpenRelease: (uid: number) => void;
  onOpenEdit:    (uid: number) => void;
}

export default function UpcomingSection({ onOpenRelease, onOpenEdit }: Props) {
  const upcoming       = useTrackerStore(s => s.upcoming);
  const priority       = useTrackerStore(s => s.priority);
  const addUpcoming    = useTrackerStore(s => s.addUpcoming);
  const deleteUpcoming = useTrackerStore(s => s.deleteUpcoming);
  const togglePriority = useTrackerStore(s => s.togglePriority);

  const [name, setName]       = useState('');
  const [element, setElement] = useState('');
  const { open, toggle, bodyRef } = useCollapse(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    addUpcoming(name.trim(), element);
    setName(''); setElement('');
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden mt-4">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface2 transition-colors"
      >
        <span className="text-xs font-semibold text-upcoming font-mono tracking-wide">◈ Upcoming / Unconfirmed</span>
        <span className={`text-subtext text-xs transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▼</span>
      </button>

      <div
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-250"
        style={{ maxHeight: open ? 'none' : '0' }}
      >
        <div className="px-3 pb-3">
          {/* Add form */}
          <div className="flex gap-2 mb-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Character name..."
              maxLength={40}
              className="
                flex-1 text-sm bg-surface2 border border-border rounded-lg px-3 py-1.5
                text-text placeholder:text-muted outline-none
                focus:border-accent transition-colors font-sans
              "
            />
            <select
              value={element}
              onChange={e => setElement(e.target.value)}
              className="
                text-xs bg-surface2 border border-border rounded-lg px-2 py-1.5
                text-subtext outline-none focus:border-accent transition-colors
                font-mono cursor-pointer
              "
            >
              <option value="">Element?</option>
              {ELEMENTS.map(el => <option key={el}>{el}</option>)}
            </select>
            <button
              onClick={handleAdd}
              className="
                text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border
                border-upcoming/40 text-upcoming hover:bg-upcoming/10 transition-all flex-shrink-0
              "
            >
              + Add
            </button>
          </div>

          {/* List */}
          {upcoming.length === 0 ? (
            <p className="text-xs text-subtext font-mono px-1">No upcoming characters added yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {upcoming.map(u => {
                const wled = priority.includes(u.uid);
                const color = u.element ? EL_COLORS[u.element] : undefined;
                return (
                  <div key={u.uid} className="flex items-center gap-2 px-2.5 py-2 bg-surface2 border border-border rounded-lg">
                    <span className="text-sm font-medium text-text flex-1 truncate">{u.name}</span>
                    {u.element && color ? (
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color, background: `${color}18` }}>
                        {u.element}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-muted">?</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePriority(u.uid)} title="Priority"
                        className={`w-6 h-6 rounded text-xs border transition-all ${wled ? 'text-wish border-wish/40 bg-wish/10' : 'text-subtext border-border hover:border-subtext'}`}>
                        ★
                      </button>
                      <button onClick={() => onOpenEdit(u.uid)} title="Edit"
                        className="w-6 h-6 rounded text-xs border border-border text-subtext hover:text-text hover:border-subtext transition-all">
                        ✎
                      </button>
                      <button onClick={() => onOpenRelease(u.uid)} title="Mark as released"
                        className="w-6 h-6 rounded text-xs border border-border text-subtext hover:text-got hover:border-got/40 transition-all">
                        ✓
                      </button>
                      <button onClick={() => deleteUpcoming(u.uid)} title="Delete"
                        className="w-6 h-6 rounded text-xs border border-border text-subtext hover:text-havoc hover:border-havoc/40 transition-all">
                        ✕
                      </button>
                    </div>
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
