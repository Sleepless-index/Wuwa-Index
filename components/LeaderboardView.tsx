import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { SIG_WEAPONS } from '@/data/weapons';
import { toImageSlug } from '@/utils/helpers';
import type { Weapon } from '@/data/weapons';

const ASTRITES_PER_PULL = 160;
const ASTRITE_ICON = 'icons/T_IconA_zcpq_UI.webp';

function AstriteIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ASTRITE_ICON} alt="astrite" width={size} height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      onError={e => (e.currentTarget.style.display = 'none')} />
  );
}

export default function LeaderboardView() {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const pullCounts = useTrackerStore(s => s.pullCounts);
  const setPulls   = useTrackerStore(s => s.setPulls);
  const weaponState = useTrackerStore(s => s.weaponState);

  const [editing, setEditing] = useState<string | null>(null); // "res-{id}" | "wep-{file}"
  const [draft,   setDraft]   = useState('');
  const [section, setSection] = useState<'resonators' | 'weapons'>('resonators');

  // ── Resonators: exclude standard banner ──
  const allEntries = versions
    .filter(g => !g.standard)
    .flatMap(g => g.entries);
  const owned = allEntries.filter(e => stateMap[e.id]?.res);

  const withPulls    = owned.filter(e => (pullCounts[e.id] ?? 0) > 0);
  const withoutPulls = owned.filter(e => !(pullCounts[e.id] ?? 0));
  const sortedRes    = [...withPulls].sort((a, b) => (pullCounts[b.id] ?? 0) - (pullCounts[a.id] ?? 0));
  const maxResPulls  = pullCounts[sortedRes[0]?.id] ?? 0;

  // ── Weapons ──
  const allWeapons = [...SIG_WEAPONS];
  const getRank = (w: Weapon) => {
    if (w.owner) {
      const e = versions.flatMap(g => g.entries).find(e => toImageSlug(e.name) === toImageSlug(w.owner!));
      return e ? (stateMap[e.id]?.wep ?? 0) : 0;
    }
    return weaponState[w.file] ?? 0;
  };
  const ownedWeapons    = allWeapons.filter(w => (pullCounts[`wep-${w.file}`] ?? 0) > 0);
  const notSetWeapons   = allWeapons.filter(w => !(pullCounts[`wep-${w.file}`] ?? 0) && getRank(w) > 0);
  const sortedWep       = [...ownedWeapons].sort((a, b) =>
    (pullCounts[`wep-${b.file}`] ?? 0) - (pullCounts[`wep-${a.file}`] ?? 0)
  );
  const maxWepPulls = pullCounts[`wep-${sortedWep[0]?.file}`] ?? 0;

  // ── Totals ──
  const resTotalPulls = withPulls.reduce((s, e) => s + (pullCounts[e.id] ?? 0), 0);
  const wepTotalPulls = ownedWeapons.reduce((s, w) => s + (pullCounts[`wep-${w.file}`] ?? 0), 0);
  const totalPulls    = resTotalPulls + wepTotalPulls;
  const totalAstrites = totalPulls * ASTRITES_PER_PULL;
  const trackedCount  = withPulls.length + ownedWeapons.length;
  const avgAstrites   = trackedCount > 0 ? Math.round(totalAstrites / trackedCount) : 0;

  const startEdit = (key: string, current?: number) => {
    setEditing(key);
    setDraft(current ? String(current) : '');
  };

  const commitEdit = (key: string) => {
    const val = parseInt(draft, 10);
    setPulls(key as any, isNaN(val) ? 0 : val);
    setEditing(null);
    setDraft('');
  };

  const isRes = section === 'resonators';

  return (
    <div className="px-4 py-4 pb-24">

      {/* ── Summary cards ── */}
      {totalPulls > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard label="total astrites" value={totalAstrites.toLocaleString()}
            icon={<AstriteIcon size={15} />} highlight />
          <StatCard label="total pulls"    value={totalPulls.toLocaleString()} />
          <StatCard label="avg per item"   value={avgAstrites.toLocaleString()}
            icon={<AstriteIcon size={13} />} />
        </div>
      )}

      {/* ── Section toggle ── */}
      <div className="flex bg-surface border border-border rounded-lg overflow-hidden mb-4 self-start w-fit">
        {(['resonators', 'weapons'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className="text-[11px] font-mono px-4 py-1.5 transition-all capitalize"
            style={{
              background: section === s ? 'rgba(76,123,214,0.1)' : 'transparent',
              color:      section === s ? '#4c7bd6' : 'var(--subtext)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {isRes && owned.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
          <AstriteIcon size={28} className="opacity-20" />
          <p className="text-xs font-mono text-center" style={{ color: 'var(--muted)', maxWidth: 200 }}>
            No owned characters yet — mark resonators in the Characters tab first.
          </p>
        </div>
      )}
      {!isRes && notSetWeapons.length === 0 && ownedWeapons.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
          <AstriteIcon size={28} className="opacity-20" />
          <p className="text-xs font-mono text-center" style={{ color: 'var(--muted)', maxWidth: 200 }}>
            No owned weapons yet — mark weapons in the Weapons tab first.
          </p>
        </div>
      )}

      {/* ── Resonators ── */}
      {isRes && (
        <>
          {sortedRes.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-4">
              {sortedRes.map((entry, idx) => {
                const key      = entry.id as any;
                const pulls    = pullCounts[key] ?? 0;
                const astrites = pulls * ASTRITES_PER_PULL;
                const elColor  = entry.element ? EL_COLORS[entry.element] : undefined;
                const slug     = toImageSlug(entry.name);
                const isEditing = editing === String(key);
                const barPct   = maxResPulls > 0 ? (pulls / maxResPulls) * 100 : 0;
                const medal    = idx === 0 ? '#f0c060' : idx === 1 ? '#b0b0b8' : idx === 2 ? '#cd8050' : null;

                return (
                  <RankedRow key={entry.id}
                    rank={idx + 1} medalColor={medal} barPct={barPct}
                    imgSrc={`icons/head_${slug}.webp`} imgStyle={{ border: `1.5px solid ${elColor ? `${elColor}44` : 'var(--border)'}` }}
                    name={entry.name} subLabel={entry.element} subColor={elColor}
                    pulls={pulls} astrites={astrites}
                    isEditing={isEditing} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(String(key), pulls)}
                    onCommit={() => commitEdit(String(key))}
                    onCancel={() => { setEditing(null); setDraft(''); }}
                    rowBorder={elColor ? `${elColor}22` : undefined}
                    barColor={elColor ? `linear-gradient(90deg,${elColor}12,${elColor}04)` : undefined}
                  />
                );
              })}
            </div>
          )}

          {withoutPulls.length > 0 && (
            <NotSetSection>
              {withoutPulls.map(entry => {
                const key       = String(entry.id);
                const isEditing = editing === key;
                const elColor   = entry.element ? EL_COLORS[entry.element] : undefined;
                return (
                  <NotSetRow key={entry.id}
                    imgSrc={`icons/head_${toImageSlug(entry.name)}.webp`}
                    name={entry.name}
                    isEditing={isEditing} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(key)}
                    onCommit={() => commitEdit(key)}
                    onCancel={() => { setEditing(null); setDraft(''); }}
                  />
                );
              })}
            </NotSetSection>
          )}
        </>
      )}

      {/* ── Weapons ── */}
      {!isRes && (
        <>
          {sortedWep.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-4">
              {sortedWep.map((w, idx) => {
                const key      = `wep-${w.file}`;
                const pulls    = pullCounts[key as any] ?? 0;
                const astrites = pulls * ASTRITES_PER_PULL;
                const isEditing = editing === key;
                const barPct   = maxWepPulls > 0 ? (pulls / maxWepPulls) * 100 : 0;
                const medal    = idx === 0 ? '#f0c060' : idx === 1 ? '#b0b0b8' : idx === 2 ? '#cd8050' : null;

                return (
                  <RankedRow key={w.file}
                    rank={idx + 1} medalColor={medal} barPct={barPct}
                    imgSrc={`weapons/${w.file}.avif`} imgStyle={{ objectFit: 'contain', background: 'rgba(255,255,255,0.02)' }}
                    name={w.name} subLabel={w.owner ? w.owner.replace(/_/g, ' ') : w.category} subColor={undefined}
                    pulls={pulls} astrites={astrites}
                    isEditing={isEditing} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(key, pulls)}
                    onCommit={() => commitEdit(key)}
                    onCancel={() => { setEditing(null); setDraft(''); }}
                  />
                );
              })}
            </div>
          )}

          {notSetWeapons.length > 0 && (
            <NotSetSection>
              {notSetWeapons.map(w => {
                const key       = `wep-${w.file}`;
                const isEditing = editing === key;
                return (
                  <NotSetRow key={w.file}
                    imgSrc={`weapons/${w.file}.avif`}
                    name={w.name}
                    isEditing={isEditing} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(key)}
                    onCommit={() => commitEdit(key)}
                    onCancel={() => { setEditing(null); setDraft(''); }}
                    imgContain
                  />
                );
              })}
            </NotSetSection>
          )}
        </>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function RankedRow({
  rank, medalColor, barPct,
  imgSrc, imgStyle, name, subLabel, subColor,
  pulls, astrites, isEditing, draft, setDraft,
  onEdit, onCommit, onCancel,
  rowBorder, barColor,
}: {
  rank: number; medalColor: string | null; barPct: number;
  imgSrc: string; imgStyle?: React.CSSProperties;
  name: string; subLabel?: string; subColor?: string;
  pulls: number; astrites: number;
  isEditing: boolean; draft: string; setDraft: (v: string) => void;
  onEdit: () => void; onCommit: () => void; onCancel: () => void;
  rowBorder?: string; barColor?: string;
}) {
  return (
    <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: `1px solid ${rowBorder ?? 'var(--border)'}` }}>
      {/* Fill bar removed */}

      {/* Medal badge */}
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 z-10"
        style={{ background: medalColor ? `${medalColor}18` : 'transparent', border: medalColor ? `1px solid ${medalColor}40` : '1px solid transparent' }}>
        <span className="text-[10px] font-mono font-bold tabular-nums"
          style={{ color: medalColor ?? 'var(--muted)' }}>{rank}</span>
      </div>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 z-10"
        style={{ border: '1.5px solid var(--border)', ...imgStyle }}
        onError={e => (e.currentTarget.style.display = 'none')} />

      {/* Name + sub */}
      <div className="flex-1 min-w-0 z-10">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
        {subLabel && (
          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5"
            style={{ color: subColor ?? 'var(--muted)', background: subColor ? `${subColor}16` : 'transparent' }}>
            {subLabel}
          </span>
        )}
      </div>

      {/* Pull input / display */}
      <div className="flex-shrink-0 z-10">
        {isEditing ? (
          <EditInput draft={draft} setDraft={setDraft} onCommit={onCommit} onCancel={onCancel} />
        ) : (
          <button onClick={onEdit}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,123,214,0.35)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <AstriteIcon size={15} />
            <div className="flex flex-col items-end">
              <span className="text-[13px] font-mono font-semibold tabular-nums leading-tight" style={{ color: 'var(--text)' }}>
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
}

function NotSetSection({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>not set</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </>
  );
}

function NotSetRow({
  imgSrc, name, isEditing, draft, setDraft, onEdit, onCommit, onCancel, imgContain,
}: {
  imgSrc: string; name: string;
  isEditing: boolean; draft: string; setDraft: (v: string) => void;
  onEdit: () => void; onCommit: () => void; onCancel: () => void;
  imgContain?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={{ background: 'transparent', border: '1px solid var(--border)', opacity: 0.55 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc} alt="" className="w-7 h-7 rounded-lg flex-shrink-0"
        style={{ objectFit: imgContain ? 'contain' : 'cover', filter: 'grayscale(0.4)', border: '1px solid var(--border)' }}
        onError={e => (e.currentTarget.style.display = 'none')} />
      <span className="flex-1 text-[12px] font-medium truncate" style={{ color: 'var(--subtext)' }}>{name}</span>
      {isEditing ? (
        <EditInput draft={draft} setDraft={setDraft} onCommit={onCommit} onCancel={onCancel} small />
      ) : (
        <button onClick={onEdit}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all"
          style={{ color: 'var(--muted)', border: '1px dashed var(--border)', background: 'transparent', opacity: 1 }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--subtext)'; el.style.borderColor = 'var(--subtext)'; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--muted)'; el.style.borderColor = 'var(--border)'; }}
        >+ set pulls</button>
      )}
    </div>
  );
}

function EditInput({ draft, setDraft, onCommit, onCancel, small }: {
  draft: string; setDraft: (v: string) => void;
  onCommit: () => void; onCancel: () => void; small?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5" style={{ opacity: 1 }}>
      <input
        autoFocus type="number" min={0} value={draft} placeholder="pulls"
        onChange={e => setDraft(e.target.value)}
        onBlur={onCommit}
        onKeyDown={e => { if (e.key === 'Enter') onCommit(); if (e.key === 'Escape') onCancel(); }}
        className={`text-center font-mono rounded-lg border outline-none ${small ? 'w-14 h-6 text-[11px]' : 'w-16 h-7 text-[12px]'}`}
        style={{ background: 'var(--surface2)', borderColor: 'rgba(76,123,214,0.5)', color: 'var(--text)' }}
      />
      <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>pulls</span>
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false }: {
  label: string; value: string; icon?: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{ background: highlight ? 'rgba(76,123,214,0.06)' : 'var(--surface)', border: highlight ? '1px solid rgba(76,123,214,0.2)' : '1px solid var(--border)' }}>
      <span className="text-[9px] font-mono uppercase tracking-widest leading-none" style={{ color: 'var(--muted)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-base font-mono font-bold tabular-nums leading-none"
          style={{ color: highlight ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
      </div>
    </div>
  );
}
