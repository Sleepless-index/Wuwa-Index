import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

const ASTRITES_PER_PULL = 160;

type SortKey = 'astrites' | 'pulls' | 'name';

export default function LeaderboardView() {
  const versions  = useTrackerStore(s => s.versions);
  const stateMap  = useTrackerStore(s => s.state);
  const setPulls  = useTrackerStore(s => s.setPulls);
  const [sort, setSort] = useState<SortKey>('astrites');
  const [editing, setEditing] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const owned = allEntries.filter(e => stateMap[e.id]?.res);

  const withPulls = owned.map(e => {
    const pulls    = stateMap[e.id]?.pulls ?? 0;
    const astrites = pulls * ASTRITES_PER_PULL;
    return { ...e, pulls, astrites };
  });

  const sorted = [...withPulls].sort((a, b) => {
    if (sort === 'astrites') return b.astrites - a.astrites;
    if (sort === 'pulls')    return b.pulls - a.pulls;
    return a.name.localeCompare(b.name);
  });

  const totalPulls    = withPulls.reduce((s, e) => s + e.pulls, 0);
  const totalAstrites = totalPulls * ASTRITES_PER_PULL;
  const tracked       = withPulls.filter(e => e.pulls > 0).length;

  const commitEdit = (id: number) => {
    const v = parseInt(editVal, 10);
    if (!isNaN(v) && v >= 0) setPulls(id, v);
    setEditing(null);
  };

  if (owned.length === 0) {
    return (
      <div className="px-4 py-4 flex flex-col items-center justify-center min-h-[200px] gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(76,123,214,0.06)', border: '1px solid rgba(76,123,214,0.14)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'rgba(76,123,214,0.4)' }}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
        <p className="text-xs font-mono text-center" style={{ color: 'var(--subtext)', maxWidth: 220 }}>
          Own some characters first, then log your pulls here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header + totals */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--subtext)' }}>
              Astrite Cost
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md"
              style={{ color: 'rgba(76,123,214,0.8)', background: 'rgba(76,123,214,0.08)', border: '1px solid rgba(76,123,214,0.18)' }}>
              {tracked}/{owned.length} tracked
            </span>
          </div>
          {/* Summary stats */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xl font-mono font-bold tabular-nums" style={{ color: 'rgba(76,123,214,0.95)' }}>
                {totalAstrites.toLocaleString()}
              </p>
              <p className="text-[9px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--muted)' }}>astrites spent</p>
            </div>
            <div className="w-px h-8" style={{ background: 'var(--border)' }} />
            <div>
              <p className="text-xl font-mono font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                {totalPulls.toLocaleString()}
              </p>
              <p className="text-[9px] font-mono uppercase tracking-wider mt-0.5" style={{ color: 'var(--muted)' }}>total pulls</p>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden flex-shrink-0">
          {(['astrites', 'pulls', 'name'] as SortKey[]).map(k => (
            <button key={k} onClick={() => setSort(k)}
              className="text-[10px] font-mono px-2.5 py-1.5 transition-all"
              style={{
                background: sort === k ? 'rgba(76,123,214,0.1)' : 'transparent',
                color:      sort === k ? '#4c7bd6' : 'var(--subtext)',
              }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 max-w-lg">
        {sorted.map((e, idx) => {
          const color    = e.element ? EL_COLORS[e.element] : undefined;
          const slug     = toImageSlug(e.name);
          const isEdit   = editing === e.id;
          const hasPulls = e.pulls > 0;
          const maxPulls = sorted[0].pulls || 1;
          const barPct   = hasPulls ? e.pulls / maxPulls : 0;

          return (
            <div key={e.id}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden transition-all"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${hasPulls ? 'rgba(42,55,80,0.9)' : 'var(--border)'}`,
              }}
            >
              {/* Background bar */}
              {hasPulls && (
                <div className="absolute inset-y-0 left-0 rounded-xl transition-all duration-500"
                  style={{ width: `${barPct * 100}%`, background: 'rgba(76,123,214,0.05)', pointerEvents: 'none' }} />
              )}

              {/* Rank */}
              <span className="text-[10px] font-mono font-bold w-5 text-center flex-shrink-0 z-10 tabular-nums"
                style={{ color: idx === 0 && hasPulls ? 'rgba(76,123,214,0.9)' : 'var(--muted)' }}>
                {idx === 0 && hasPulls ? '▲' : idx + 1}
              </span>

              {/* Head icon */}
              <div className="relative flex-shrink-0 z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`icons/head_${slug}.webp`} alt=""
                  className="w-8 h-8 rounded-lg object-cover"
                  style={{ border: color ? `1px solid ${color}40` : '1px solid var(--border)' }}
                  onError={e => (e.currentTarget.style.display = 'none')} />
              </div>

              {/* Name + element */}
              <div className="flex-1 min-w-0 z-10">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{e.name}</p>
                {e.element && (
                  <p className="text-[9px] font-mono" style={{ color: color ? `${color}99` : 'var(--muted)' }}>{e.element}</p>
                )}
              </div>

              {/* Pull input + astrite display */}
              <div className="flex items-center gap-2 flex-shrink-0 z-10">
                {isEdit ? (
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    value={editVal}
                    onChange={ev => setEditVal(ev.target.value)}
                    onBlur={() => commitEdit(e.id)}
                    onKeyDown={ev => { if (ev.key === 'Enter') commitEdit(e.id); if (ev.key === 'Escape') setEditing(null); }}
                    className="w-16 h-7 rounded-lg text-center text-[11px] font-mono font-bold outline-none"
                    style={{
                      background: 'rgba(76,123,214,0.1)',
                      border: '1px solid rgba(76,123,214,0.5)',
                      color: '#4c7bd6',
                    }}
                  />
                ) : (
                  <button
                    onClick={() => { setEditing(e.id); setEditVal(String(e.pulls || '')); }}
                    className="flex flex-col items-end gap-0.5 rounded-lg px-2 py-1 transition-all"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.borderColor = 'rgba(76,123,214,0.25)'; (ev.currentTarget as HTMLElement).style.background = 'rgba(76,123,214,0.05)'; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.borderColor = 'transparent'; (ev.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {hasPulls ? (
                      <>
                        <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: '#4c7bd6' }}>
                          {(e.astrites).toLocaleString()} ✦
                        </span>
                        <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>
                          {e.pulls} pulls
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                        + log pulls
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono mt-4" style={{ color: 'var(--muted)' }}>
        1 pull = {ASTRITES_PER_PULL} ✦ · click any row to edit pull count
      </p>
    </div>
  );
}
