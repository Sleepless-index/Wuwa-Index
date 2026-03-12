import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';

const ASTRITES_PER_PULL = 160;
const ASTRITE_ICON = 'icons/T_IconA_zcpq_UI.webp';

function AstriteIcon({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASTRITE_ICON}
      alt="astrite"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      onError={e => (e.currentTarget.style.display = 'none')}
    />
  );
}

export default function LeaderboardView() {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const pullCounts = useTrackerStore(s => s.pullCounts);
  const setPulls   = useTrackerStore(s => s.setPulls);

  const [editing, setEditing] = useState<number | null>(null);
  const [draft,   setDraft]   = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const owned = allEntries.filter(e => stateMap[e.id]?.res);

  const withPulls    = owned.filter(e => (pullCounts[e.id] ?? 0) > 0);
  const withoutPulls = owned.filter(e => !(pullCounts[e.id] ?? 0));

  const sorted = [...withPulls].sort((a, b) =>
    (pullCounts[b.id] ?? 0) - (pullCounts[a.id] ?? 0)
  );

  const totalPulls    = withPulls.reduce((s, e) => s + (pullCounts[e.id] ?? 0), 0);
  const totalAstrites = totalPulls * ASTRITES_PER_PULL;
  const avgAstrites   = withPulls.length > 0 ? Math.round(totalAstrites / withPulls.length) : 0;
  const maxPulls      = pullCounts[sorted[0]?.id] ?? 0;

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
    <div className="px-4 py-4 max-w-xl">

      {/* ── Summary cards ── */}
      {totalPulls > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard
            label="total astrites"
            value={totalAstrites.toLocaleString()}
            icon={<AstriteIcon size={13} />}
            highlight
          />
          <StatCard
            label="total pulls"
            value={totalPulls.toLocaleString()}
          />
          <StatCard
            label="avg per char"
            value={avgAstrites.toLocaleString()}
            icon={<AstriteIcon size={11} />}
          />
        </div>
      )}

      {/* ── Empty state ── */}
      {owned.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
          <AstriteIcon size={32} className="opacity-20" />
          <p className="text-xs font-mono text-center" style={{ color: 'var(--muted)', maxWidth: 200 }}>
            No owned characters yet — mark resonators in the Characters tab first.
          </p>
        </div>
      )}

      {/* ── Ranked rows ── */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {sorted.map((entry, idx) => {
            const pulls     = pullCounts[entry.id] ?? 0;
            const astrites  = pulls * ASTRITES_PER_PULL;
            const elColor   = entry.element ? EL_COLORS[entry.element] : undefined;
            const slug      = toImageSlug(entry.name);
            const isEditing = editing === entry.id;
            const barPct    = maxPulls > 0 ? (pulls / maxPulls) * 100 : 0;

            const rankMedal =
              idx === 0 ? { color: '#f0c060', label: '1' } :
              idx === 1 ? { color: '#b0b0b8', label: '2' } :
              idx === 2 ? { color: '#cd8050', label: '3' } :
              null;

            return (
              <div
                key={entry.id}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${elColor ? `${elColor}22` : 'var(--border)'}`,
                }}
              >
                {/* Animated fill bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 pointer-events-none"
                  style={{
                    width: `${barPct}%`,
                    background: elColor
                      ? `linear-gradient(90deg, ${elColor}12 0%, ${elColor}04 100%)`
                      : 'rgba(76,123,214,0.04)',
                    transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />

                {/* Rank badge */}
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 z-10"
                  style={{
                    background: rankMedal ? `${rankMedal.color}18` : 'transparent',
                    border: rankMedal ? `1px solid ${rankMedal.color}40` : '1px solid transparent',
                  }}
                >
                  <span
                    className="text-[10px] font-mono font-bold tabular-nums"
                    style={{ color: rankMedal ? rankMedal.color : 'var(--muted)' }}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Head icon */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`icons/head_${slug}.webp`}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover flex-shrink-0 z-10"
                  style={{ border: `1.5px solid ${elColor ? `${elColor}44` : 'var(--border)'}` }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />

                {/* Name + element pill */}
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {entry.name}
                  </p>
                  {entry.element && elColor && (
                    <span
                      className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                      style={{ color: elColor, background: `${elColor}16` }}
                    >
                      {entry.element}
                    </span>
                  )}
                </div>

                {/* Astrite display / pull input */}
                <div className="flex-shrink-0 z-10">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={() => commitEdit(entry.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  commitEdit(entry.id);
                          if (e.key === 'Escape') { setEditing(null); setDraft(''); }
                        }}
                        placeholder="pulls"
                        className="w-16 h-7 text-center text-[12px] font-mono rounded-lg border outline-none"
                        style={{
                          background: 'var(--surface2)',
                          borderColor: 'rgba(76,123,214,0.5)',
                          color: 'var(--text)',
                        }}
                      />
                      <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>pulls</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(entry.id)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
                      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,123,214,0.35)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                      title="Click to edit pulls"
                    >
                      <AstriteIcon size={13} />
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-mono font-semibold tabular-nums leading-tight"
                          style={{ color: 'var(--text)' }}>
                          {astrites.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-mono leading-none" style={{ color: 'var(--muted)' }}>
                          {pulls} pulls
                        </span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Characters without pulls set ── */}
      {withoutPulls.length > 0 && owned.length > 0 && (
        <>
          {withPulls.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                not set
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            {withoutPulls.map(entry => {
              const elColor   = entry.element ? EL_COLORS[entry.element] : undefined;
              const slug      = toImageSlug(entry.name);
              const isEditing = editing === entry.id;

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    opacity: 0.55,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`icons/head_${slug}.webp`}
                    alt=""
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                    style={{ filter: 'grayscale(0.4)', border: `1px solid ${elColor ? `${elColor}30` : 'var(--border)'}` }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="flex-1 text-[12px] font-medium truncate" style={{ color: 'var(--subtext)' }}>
                    {entry.name}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5" style={{ opacity: 1 }}>
                      <input
                        autoFocus
                        type="number"
                        min={0}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onBlur={() => commitEdit(entry.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  commitEdit(entry.id);
                          if (e.key === 'Escape') { setEditing(null); setDraft(''); }
                        }}
                        placeholder="pulls"
                        className="w-16 h-6 text-center text-[11px] font-mono rounded-lg border outline-none"
                        style={{
                          background: 'var(--surface2)',
                          borderColor: 'rgba(76,123,214,0.5)',
                          color: 'var(--text)',
                        }}
                      />
                      <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>pulls</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(entry.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all"
                      style={{ color: 'var(--muted)', border: '1px dashed var(--border)', background: 'transparent' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--subtext)'; el.style.borderColor = 'var(--subtext)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--muted)'; el.style.borderColor = 'var(--border)'; }}
                    >
                      + set pulls
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon, highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{
        background: highlight ? 'rgba(76,123,214,0.06)' : 'var(--surface)',
        border: highlight ? '1px solid rgba(76,123,214,0.2)' : '1px solid var(--border)',
      }}
    >
      <span className="text-[9px] font-mono uppercase tracking-widest leading-none" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span
          className="text-base font-mono font-bold tabular-nums leading-none"
          style={{ color: highlight ? 'var(--accent)' : 'var(--text)' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
