import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

const ASTRITES_PER_PULL = 160;

export default function AstriteView() {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const setPulls   = useTrackerStore(s => s.setPulls);

  const allEntries = versions.flatMap(g => g.entries);
  const owned      = allEntries.filter(e => stateMap[e.id]?.res);

  // Sort leaderboard by astrites descending
  const leaderboard = [...owned]
    .map(e => ({
      ...e,
      pulls:    stateMap[e.id]?.pulls ?? 0,
      astrites: (stateMap[e.id]?.pulls ?? 0) * ASTRITES_PER_PULL,
    }))
    .filter(e => e.pulls > 0)
    .sort((a, b) => b.astrites - a.astrites);

  const totalAstrites = leaderboard.reduce((s, e) => s + e.astrites, 0);
  const totalPulls    = leaderboard.reduce((s, e) => s + e.pulls, 0);

  return (
    <div className="px-4 py-4 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--subtext)' }}>
          Astrite Cost
        </span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
          · {ASTRITES_PER_PULL} per pull
        </span>
      </div>

      {/* Summary */}
      {leaderboard.length > 0 && (
        <div className="flex items-stretch gap-3 mb-6">
          <Stat label="Total Astrites" value={totalAstrites.toLocaleString()} />
          <Stat label="Total Pulls" value={totalPulls.toLocaleString()} />
          <Stat label="Characters Tracked" value={`${leaderboard.length}/${owned.length}`} />
        </div>
      )}

      {/* Input rows — all owned characters */}
      <div className="mb-6">
        <p className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
          Input Pulls
        </p>
        <div className="flex flex-col gap-1.5">
          {owned.length === 0 ? (
            <p className="text-xs font-mono" style={{ color: 'var(--subtext)' }}>
              No characters owned yet.
            </p>
          ) : (
            owned.map(e => (
              <InputRow
                key={e.id}
                entry={e}
                pulls={stateMap[e.id]?.pulls ?? 0}
                onSet={val => setPulls(e.id, val)}
              />
            ))
          )}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Leaderboard
          </p>
          <div className="flex flex-col gap-1.5">
            {leaderboard.map((e, idx) => (
              <LeaderboardRow key={e.id} entry={e} rank={idx + 1} total={leaderboard[0].astrites} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl px-3 py-2.5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-sm font-mono font-bold" style={{ color: '#4c7bd6' }}>{value}</p>
    </div>
  );
}

function InputRow({ entry, pulls, onSet }: {
  entry: { id: number; name: string; element: string };
  pulls: number;
  onSet: (v: number) => void;
}) {
  const [draft, setDraft] = useState(pulls > 0 ? String(pulls) : '');
  const elColor = EL_COLORS[entry.element];
  const slug    = toImageSlug(entry.name);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    onSet(isNaN(n) || n < 0 ? 0 : n);
    if (isNaN(n) || n <= 0) setDraft('');
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Head icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`icons/head_${slug}.webp`} alt=""
        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
        style={{ border: elColor ? `1px solid ${elColor}44` : '1px solid var(--border)' }}
        onError={e => (e.currentTarget.style.display = 'none')} />

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
        {entry.name}
      </span>

      {/* Astrites preview */}
      {pulls > 0 && (
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--subtext)' }}>
          {(pulls * 160).toLocaleString()} ✦
        </span>
      )}

      {/* Pull input */}
      <input
        type="number"
        min={0}
        value={draft}
        placeholder="pulls"
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && commit(draft)}
        className="w-16 h-7 rounded-lg px-2 text-[11px] font-mono text-right outline-none transition-all"
        style={{
          background:  'var(--surface2)',
          border:      '1px solid var(--border)',
          color:       'var(--text)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(76,123,214,0.5)')}
        onBlurCapture={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
    </div>
  );
}

function LeaderboardRow({ entry, rank, total }: {
  entry: { name: string; element: string; pulls: number; astrites: number };
  rank: number;
  total: number;
}) {
  const elColor = EL_COLORS[entry.element];
  const slug    = toImageSlug(entry.name);
  const pct     = total > 0 ? entry.astrites / total : 0;

  const rankColor = rank === 1 ? '#4c7bd6' : rank === 2 ? '#6b8fd4' : rank === 3 ? '#8aa3d2' : 'var(--muted)';

  return (
    <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: `1px solid ${rank === 1 ? 'rgba(76,123,214,0.4)' : 'var(--border)'}` }}>

      {/* Bar fill behind */}
      <div className="absolute inset-0 pointer-events-none rounded-xl"
        style={{ width: `${pct * 100}%`, background: 'rgba(76,123,214,0.04)', borderRight: pct < 1 ? '1px solid rgba(76,123,214,0.08)' : 'none' }} />

      {/* Rank */}
      <span className="text-[10px] font-mono font-bold w-5 text-center flex-shrink-0 tabular-nums z-10"
        style={{ color: rankColor }}>
        {rank === 1 ? '★' : rank}
      </span>

      {/* Head */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`icons/head_${slug}.webp`} alt=""
        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 z-10"
        style={{ border: elColor ? `1px solid ${elColor}44` : '1px solid var(--border)' }}
        onError={e => (e.currentTarget.style.display = 'none')} />

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium z-10" style={{ color: 'var(--text)' }}>
        {entry.name}
      </span>

      {/* Pulls + astrites */}
      <div className="flex flex-col items-end flex-shrink-0 z-10">
        <span className="text-[11px] font-mono font-bold" style={{ color: '#4c7bd6' }}>
          {entry.astrites.toLocaleString()} ✦
        </span>
        <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>
          {entry.pulls} pulls
        </span>
      </div>
    </div>
  );
}
