import { useState, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { generateSnapshot } from '@/utils/snapshot';
import { toImageSlug } from '@/utils/helpers';
import type { SnapView } from '@/types';

export default function SnapshotModal({ onClose }: { onClose: () => void }) {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const allEntries = versions.flatMap(g => g.entries);

  const [snapView,  setSnapView]  = useState<SnapView>('gallery');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const copied = await generateSnapshot({ snapView, ownedOnly, allEntries, versions, state: stateMap });
      setExportMsg(copied ? '✓ copied + saved!' : '✓ saved!');
    } catch {
      setExportMsg('✕ failed');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(''), 2500);
    }
  }, [snapView, ownedOnly, allEntries, versions, stateMap]);

  const owned    = allEntries.filter(e => stateMap[e.id]?.res);
  const notOwned = allEntries.filter(e => !stateMap[e.id]?.res);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Action bar ── */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-[var(--surface2)] border-b border-[var(--border)] rounded-t-2xl">
          {/* View toggle */}
          <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-md overflow-hidden flex-shrink-0">
            {(['gallery', 'list'] as const).map(v => {
              const active = v === 'list' ? snapView === 'regions' : snapView === 'gallery';
              return (
                <button
                  key={v}
                  onClick={() => setSnapView(v === 'list' ? 'regions' : 'gallery')}
                  className={`text-[11px] font-mono px-3 py-1.5 transition-all ${active ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--subtext)] hover:text-[var(--text)]'}`}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {/* Owned only */}
          <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
            <input type="checkbox" checked={ownedOnly} onChange={e => setOwnedOnly(e.target.checked)} className="cb" />
            <span className="text-[11px] font-mono text-[var(--subtext)]">owned only</span>
          </label>

          {/* Export + close — pushed to the right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {exportMsg && (
              <span className={`text-[11px] font-mono ${exportMsg.startsWith('✓') ? 'text-[var(--got)]' : 'text-[var(--havoc)]'}`}>
                {exportMsg}
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-all disabled:opacity-50"
            >
              {exporting ? 'generating…' : '⎘ copy + save'}
            </button>
            <button
              onClick={onClose}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--subtext)] hover:text-[var(--text)] hover:border-[var(--subtext)] transition-all"
            >
              close
            </button>
          </div>
        </div>

        {/* ── Stats header ── */}
        <SnapStatsHeader allEntries={allEntries} stateMap={stateMap} />

        {/* ── Preview content ── */}
        <div className="overflow-y-auto p-4">
          {snapView === 'gallery'
            ? <GalleryPreview owned={owned} stateMap={stateMap} />
            : <RegionsPreview versions={versions} ownedOnly={ownedOnly} stateMap={stateMap} />
          }
        </div>
      </div>
    </div>
  );
}

/* ── Stats header ── */
function SnapStatsHeader({ allEntries, stateMap }: any) {
  const total = allEntries.length;
  const got   = allEntries.filter((e: any) => stateMap[e.id]?.res).length;
  const sig   = allEntries.filter((e: any) => (stateMap[e.id]?.wep ?? 0) > 0).length;
  return (
    <div className="flex items-center gap-6 px-4 py-2.5 border-b border-[var(--border)]">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-mono font-semibold text-[var(--got)]">{got}/{total}</span>
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wide">resonators</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-mono font-semibold text-[var(--sig)]">{sig}/{total}</span>
        <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wide">sig weapons</span>
      </div>
    </div>
  );
}

/* ── Gallery view — owned / not-owned card grid ── */
function GalleryPreview({ owned, stateMap }: any) {
  return (
    <div>
      {owned.length > 0 && (
        <CardGroup label={`owned · ${owned.length}`} entries={owned} stateMap={stateMap} />
      )}
    </div>
  );
}

function CardGroup({ label, entries, stateMap }: any) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-mono text-[var(--subtext)] uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {entries.map((e: any) => <SnapCard key={e.id} entry={e} s={stateMap[e.id]} />)}
      </div>
    </div>
  );
}

function SnapCard({ entry, s }: any) {
  const slug     = toImageSlug(entry.name);
  const obtained = s?.res;
  const isMaxS   = s?.seq === 6;
  const isMaxR   = s?.wep === 5;

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex-shrink-0 transition-all`}
      style={{ width: 90, height: 130, border: `1px solid ${obtained ? 'rgba(126,184,247,0.35)' : 'rgba(54,60,71,0.7)'}` }}
    >
      {/* Art image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`art/art_${slug}.avif`}
        alt={entry.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: obtained ? 1 : 0.28 }}
        onError={e => { (e.currentTarget as HTMLImageElement).src = `icons/head_${slug}.webp`; }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(8,10,14,0.93) 100%)' }} />

      {/* Name + S/R badge inline at bottom */}
      <div className="absolute bottom-0 inset-x-0 px-1.5 pb-1.5 flex items-center gap-1">
        <p className="text-[9px] font-semibold leading-tight truncate flex-1 min-w-0" style={{ color: obtained ? '#f5f0e8' : '#45495a' }}>
          {entry.name}
        </p>
        {obtained && (
          <div
            className="flex rounded px-1 py-0.5 flex-shrink-0"
            style={{
              background: 'rgba(13,13,25,0.88)',
              border: `0.75px solid ${isMaxS && isMaxR ? 'rgba(245,216,138,0.65)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <span className="text-[8px] font-mono font-bold" style={{ color: isMaxS ? '#f5d88a' : '#b794f4' }}>
              S{s?.seq ?? 0}
            </span>
            <span className="text-[8px] font-mono" style={{ color: isMaxR ? '#f5d88a' : '#7eb8f7' }}>
              R{s?.wep ?? 0}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Regions / list view — version columns ── */
function RegionsPreview({ versions, ownedOnly, stateMap }: any) {
  const visCols = versions.filter(({ entries }: any) =>
    !ownedOnly || entries.some((e: any) => stateMap[e.id]?.res)
  );

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {visCols.map(({ label, entries }: any, ci: number) => {
        const filtered = ownedOnly ? entries.filter((e: any) => stateMap[e.id]?.res) : entries;
        const got      = entries.filter((e: any) => stateMap[e.id]?.res).length;

        return (
          <div
            key={label}
            className="flex-shrink-0 min-w-[155px]"
            style={{ borderRight: ci < visCols.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingRight: 12, paddingLeft: ci === 0 ? 0 : 12 }}
          >
            {/* Version label */}
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-[9px] font-mono font-bold text-[var(--subtext)] uppercase tracking-wider">{label}</span>
              <span className="text-[9px] font-mono text-[var(--muted)]">{got}/{entries.length}</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-0.5">
              {filtered.map((e: any) => {
                const s    = stateMap[e.id];
                const slug = toImageSlug(e.name);
                const seqTxt = s?.res ? `S${s.seq ?? 0}` : '';
                const wepTxt = s?.res ? `R${s.wep ?? 0}` : '';
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-1.5 px-1.5 rounded-lg"
                    style={{
                      height: 28,
                      background: s?.res ? 'rgba(126,184,247,0.05)' : 'transparent',
                      border:     s?.res ? '0.75px solid rgba(126,184,247,0.18)' : '0.75px solid transparent',
                    }}
                  >
                    {/* Head icon */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`icons/head_${slug}.webp`}
                      alt=""
                      className="rounded object-cover flex-shrink-0"
                      style={{ width: 20, height: 20, opacity: s?.res ? 1 : 0.3, borderRadius: 4 }}
                      onError={ei => (ei.currentTarget.style.display = 'none')}
                    />
                    {/* Name */}
                    <span
                      className="flex-1 truncate text-[10px] font-medium"
                      style={{ color: s?.res ? 'var(--text)' : 'var(--muted)' }}
                    >
                      {e.name}
                    </span>
                    {/* S/R tag */}
                    {s?.res && (
                      <span
                        className="flex-shrink-0 flex rounded px-1 py-0.5"
                        style={{ background: 'rgba(13,13,25,0.7)', border: '0.5px solid rgba(255,255,255,0.06)' }}
                      >
                        <span className="text-[8px] font-mono font-bold" style={{ color: s.seq === 6 ? '#f5d88a' : '#b794f4' }}>{seqTxt}</span>
                        <span className="text-[8px] font-mono"           style={{ color: s.wep === 5 ? '#f5d88a' : '#7eb8f7' }}>{wepTxt}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
