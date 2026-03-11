import { useTrackerStore } from '@/store/trackerStore';
import { EL_ORDER, EL_COLORS } from '@/data/resonators';

interface Props { onClose: () => void; }

export default function FilterBar({ onClose }: Props) {
  const filter    = useTrackerStore(s => s.activeFilter);
  const setFilter = useTrackerStore(s => s.setFilter);

  const handleSelect = (el: string) => {
    setFilter(filter === el ? 'All' : el);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer — slides in from right */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-56 flex flex-col bg-surface border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-xs font-mono font-semibold text-subtext uppercase tracking-widest">Filter</span>
          <button
            onClick={onClose}
            className="text-subtext hover:text-text transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Pills */}
        <div className="flex flex-col gap-1.5 p-4 overflow-y-auto">
          {EL_ORDER.map(el => {
            const color  = EL_COLORS[el];
            const active = filter === el;
            return (
              <button
                key={el}
                onClick={() => handleSelect(el)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left"
                style={{
                  background:  active ? `${color}14` : 'var(--surface2)',
                  borderColor: active ? color        : 'var(--border)',
                  color:       active ? color        : 'var(--subtext)',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`icons/icon_${el}.webp`}
                  alt=""
                  className="w-5 h-5 object-contain flex-shrink-0"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <span className="text-[13px] font-mono font-semibold min-w-0 truncate">{el}</span>
                {active && (
                  <span className="ml-auto text-[10px] flex-shrink-0">✓</span>
                )}
              </button>
            );
          })}

          {/* Clear */}
          {filter !== 'All' && (
            <button
              onClick={() => { setFilter('All'); onClose(); }}
              className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-border text-subtext hover:text-text hover:border-subtext transition-all text-[11px] font-mono"
            >
              clear filter
            </button>
          )}
        </div>
      </div>
    </>
  );
}
