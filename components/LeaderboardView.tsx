import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

const ASTRITES_PER_PULL = 160;

export default function LeaderboardView() {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const pullCounts = useTrackerStore(s => s.pullCounts);
  const setPulls   = useTrackerStore(s => s.setPulls);

  const [editing, setEditing] = useState<number | null>(null);
  const [draft,   setDraft]   = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const owned = allEntries.filter(e => stateMap[e.id]?.res);

  // Sort by astrites descending; unset entries go to bottom
  const sorted = [...owned].sort((a, b) => {
    const pa = pullCounts[a.id] ?? 0;
    const pb = pullCounts[b.id] ?? 0;
    return pb - pa;
  });

  const totalPulls    = owned.reduce((sum, e) => sum + (pullCounts[e.id] ?? 0), 0);
  const totalAstrites = totalPulls * ASTRITES_PER_PULL;

  const startEdit = (id: number) => {
    setEditing(id);
    setDraft(pullCounts[id] ? String(pullCounts[id]) : '');
  };

  const commitEdit = (id: number) => {
    const val = parseInt(draft, 10);
    setPulls(id, isNaN(val) ? 0 : val);
    setEditing(null);
    setDraft('');
  };

  return (
    <div className="px-4 py-4 max-w-lg">

      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase mb-1"
            style={{ color: 'var(--subtext)' }}>
            Astrite Cost
          </p>
          <p className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
            1 pull = 160 astrites
          </p>
        </div>
        {totalPulls > 0 && (
          <div className="text-right">
            <p className="text-lg font-mono font-bold" style={{ color: 'var(--accent)' }}>
              {totalAstrites.toLocaleString()}
            </p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
              total astrites · {totalPulls} pulls
            </p>
          </div>
        )}
      </div>

      {/* Empty state */}
      {owned.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
          <p className="text-xs font-mono text-center" style={{ color: 'var(--muted)', maxWidth: 220 }}>
            No owned characters yet. Check off resonators in the Characters tab first.
          </p>
        </div>
      )}

      {/* Leaderboard rows */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {sorted.map((entry, idx) => {
            const pulls    = pullCounts[entry.id] ?? 0;
            const astrites = pulls * ASTRITES_PER_PULL;
            const elColor  = entry.element ? EL_COLORS[entry.element] : undefined;
            const slug     = toImageSlug(entry.name);
            const isEditing = editing === entry.id;

            // Bar width relative to top entry
            const maxPulls = pullCounts[sorted[0]?.id] ?? 0;
            const barPct   = maxPulls > 0 ? (pulls / maxPulls) * 100 : 0;

            const rankColor =
              idx === 0 ? '#f0c060' :
              idx === 1 ? '#aaaaaa' :
              idx === 2 ? '#cd7f32' :
              'var(--muted)';

            return (
              <div
                key={entry.id}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
                style={{
                  background: elColor ? `${elColor}06` : 'var(--surface)',
                  border:     elColor ? `1px solid ${elColor}20` : '1px solid var(--border)',
                }}
              >
                {/* Progress bar background */}
                {pulls > 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{
                      width: `${barPct}%`,
                      background: elColor ? `${elColor}08` : 'rgba(76,123,214,0.04)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                )}

                {/* Rank */}
                <span
                  className="text-[11px] font-mono font-bold w-5 text-center flex-shrink-0 tabular-nums z-10"
                  style={{ color: rankColor }}
                >
                  {pulls > 0 ? (idx + 1) : '—'}
                </span>

                {/* Head icon */}
                <div className="relative flex-shrink-0 z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`icons/head_${slug}.webp`}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover"
                    style={{
                      border: elColor ? `1px solid ${elColor}44` : '1px solid var(--border)',
                    }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>

                {/* Name + element */}
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>
                    {entry.name}
                  </p>
                  {entry.element && (
                    <p className="text-[10px] font-mono" style={{ color: elColor ?? 'var(--muted)' }}>
                      {entry.element}
                    </p>
                  )}
                </div>

                {/* Pull input + astrite count */}
                <div className="flex items-center gap-2 flex-shrink-0 z-10">
                  {isEditing ? (
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onBlur={() => commitEdit(entry.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit(entry.id);
                        if (e.key === 'Escape') { setEditing(null); setDraft(''); }
                      }}
                      className="w-16 h-7 text-center text-[12px] font-mono rounded-lg border outline-none"
                      style={{
                        background: 'var(--surface2)',
                        borderColor: 'rgba(76,123,214,0.5)',
                        color: 'var(--text)',
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(entry.id)}
                      className="flex flex-col items-end rounded-lg px-2 py-1 transition-all"
                      style={{ background: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      title="Click to set pulls"
                    >
                      {pulls > 0 ? (
                        <>
                          <span className="text-[12px] font-mono font-semibold tabular-nums"
                            style={{ color: 'var(--accent)' }}>
                            {astrites.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>
                            {pulls} pulls
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
                          + pulls
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
