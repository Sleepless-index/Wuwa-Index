import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

const PULLS_TO_ASTRITES = 160;

export default function AstritePanel() {
  const versions  = useTrackerStore(s => s.versions);
  const stateMap  = useTrackerStore(s => s.state);
  const setPulls  = useTrackerStore(s => s.setPulls);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft,   setDraft]   = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const owned = allEntries
    .filter(e => stateMap[e.id]?.res)
    .map(e => ({
      ...e,
      pulls:    stateMap[e.id]?.pulls ?? 0,
      astrites: (stateMap[e.id]?.pulls ?? 0) * PULLS_TO_ASTRITES,
    }))
    .filter(e => e.pulls > 0)
    .sort((a, b) => b.astrites - a.astrites);

  const allOwned = allEntries.filter(e => stateMap[e.id]?.res);
  const totalPulls    = allOwned.reduce((sum, e) => sum + (stateMap[e.id]?.pulls ?? 0), 0);
  const totalAstrites = totalPulls * PULLS_TO_ASTRITES;

  const startEdit = (id: number, current: number) => {
    setEditing(id);
    setDraft(current > 0 ? String(current) : '');
  };

  const commitEdit = (id: number) => {
    const val = parseInt(draft, 10);
    setPulls(id, isNaN(val) || val < 0 ? 0 : val);
    setEditing(null);
    setDraft('');
  };

  return (
    <div className="px-4 py-4 max-w-2xl">

      {/* Header stats */}
      {totalPulls > 0 && (
        <div className="flex items-center gap-6 mb-6 px-4 py-3 rounded-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>Total Pulls</p>
            <p className="text-xl font-mono font-bold tabular-nums" style={{ color: '#4c7bd6' }}>{totalPulls.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 self-center" style={{ background: 'var(--border)' }} />
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>Total Astrites</p>
            <p className="text-xl font-mono font-bold tabular-nums" style={{ color: '#4c7bd6' }}>{totalAstrites.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: 'rgba(76,123,214,0.5)' }} />
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--subtext)' }}>
          Leaderboard
        </span>
        {owned.length > 0 && (
          <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>
            {owned.length} with pulls logged
          </span>
        )}
      </div>

      {/* Leaderboard */}
      {owned.length === 0 ? (
        <p className="text-xs font-mono" style={{ color: 'var(--subtext)' }}>
          No pulls logged yet — click any owned character below to add their pull count.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 mb-6">
          {owned.map((e, idx) => {
            const color = e.element ? EL_COLORS[e.element] : undefined;
            const slug  = toImageSlug(e.name);
            const isTop = idx === 0;
            return (
              <div key={e.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: isTop ? 'rgba(76,123,214,0.07)' : 'var(--surface)',
                  border: `1px solid ${isTop ? 'rgba(76,123,214,0.3)' : 'var(--border)'}`,
                }}
              >
                {/* Rank */}
                <span className="w-5 text-center text-[10px] font-mono font-bold flex-shrink-0 tabular-nums"
                  style={{ color: isTop ? '#4c7bd6' : 'var(--muted)' }}>
                  {isTop ? '▲' : idx + 1}
                </span>

                {/* Head */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`icons/head_${slug}.webp`} alt=""
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  style={{ border: color ? `1px solid ${color}44` : '1px solid var(--border)' }}
                  onError={e => (e.currentTarget.style.display = 'none')} />

                {/* Name */}
                <span className="flex-1 min-w-0 truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {e.name}
                </span>

                {/* Pulls */}
                <div className="flex items-baseline gap-1 flex-shrink-0">
                  <span className="text-xs font-mono font-semibold tabular-nums" style={{ color: '#4c7bd6' }}>
                    {e.pulls}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>pulls</span>
                </div>

                {/* Astrites */}
                <div className="flex items-center gap-1 flex-shrink-0 min-w-[90px] justify-end">
                  <span className="text-xs font-mono font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                    {e.astrites.toLocaleString()}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>✦</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input list — all owned characters */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: 'rgba(76,123,214,0.35)' }} />
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--subtext)' }}>
          Log Pulls
        </span>
      </div>

      {allOwned.length === 0 ? (
        <p className="text-xs font-mono" style={{ color: 'var(--subtext)' }}>
          No owned characters yet — toggle characters on the Characters tab first.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {allOwned.map(e => {
            const pulls   = stateMap[e.id]?.pulls ?? 0;
            const isEdit  = editing === e.id;
            const color   = e.element ? EL_COLORS[e.element] : undefined;
            const slug    = toImageSlug(e.name);
            return (
              <div key={e.id}
                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                style={{
                  background: isEdit ? 'rgba(76,123,214,0.05)' : 'transparent',
                  border: `1px solid ${isEdit ? 'rgba(76,123,214,0.25)' : 'transparent'}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`icons/head_${slug}.webp`} alt=""
                  className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                  style={{ border: color ? `1px solid ${color}33` : '1px solid var(--border)', opacity: 0.85 }}
                  onError={e => (e.currentTarget.style.display = 'none')} />

                <span className="flex-1 min-w-0 truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                  {e.name}
                </span>

                {/* Astrites preview */}
                {pulls > 0 && !isEdit && (
                  <span className="text-[10px] font-mono tabular-nums flex-shrink-0" style={{ color: 'var(--muted)' }}>
                    {(pulls * PULLS_TO_ASTRITES).toLocaleString()} ✦
                  </span>
                )}

                {/* Edit input or pull display */}
                {isEdit ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      value={draft}
                      onChange={ev => setDraft(ev.target.value)}
                      onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(e.id); if (ev.key === 'Escape') setEditing(null); }}
                      autoFocus
                      placeholder="pulls"
                      className="w-16 h-7 rounded-lg text-center text-[11px] font-mono outline-none"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid rgba(76,123,214,0.4)',
                        color: '#4c7bd6',
                      }}
                    />
                    <button onClick={() => commitEdit(e.id)}
                      className="h-7 px-2 rounded-lg text-[10px] font-mono font-semibold transition-all"
                      style={{ background: 'rgba(76,123,214,0.15)', color: '#4c7bd6', border: '1px solid rgba(76,123,214,0.3)' }}>
                      ✓
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="h-7 px-2 rounded-lg text-[10px] font-mono transition-all"
                      style={{ color: 'var(--subtext)', border: '1px solid transparent' }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(e.id, pulls)}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[10px] font-mono transition-all flex-shrink-0"
                    style={{
                      background: pulls > 0 ? 'rgba(76,123,214,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${pulls > 0 ? 'rgba(76,123,214,0.25)' : 'var(--border)'}`,
                      color: pulls > 0 ? '#4c7bd6' : 'var(--muted)',
                    }}
                  >
                    {pulls > 0 ? `${pulls} pulls` : '+ log pulls'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
