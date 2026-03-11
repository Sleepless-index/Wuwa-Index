import { useState, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import { generateWeaponSnapshot } from '@/utils/snapshot';
import { toImageSlug } from '@/utils/helpers';
import type { Weapon } from '@/data/weapons';

type WeaponView = 'gallery' | 'list';

export default function WeaponSnapshotModal({ onClose }: { onClose: () => void }) {
  const versions     = useTrackerStore(s => s.versions);
  const state        = useTrackerStore(s => s.state);
  const weaponState  = useTrackerStore(s => s.weaponState);

  const [view,      setView]      = useState<WeaponView>('gallery');
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const allWeapons = [...SIG_WEAPONS, ...STD_WEAPONS];

  const getRank = (w: Weapon) => {
    if (w.owner) {
      const e = allEntries.find(e => toImageSlug(e.name) === toImageSlug(w.owner!));
      return e ? (state[e.id]?.wep ?? 0) : 0;
    }
    return weaponState[w.file] ?? 0;
  };

  const owned = allWeapons.filter(w => getRank(w) > 0);

  const handleExport = useCallback(async () => {
    setExporting(true); setExportMsg('');
    try {
      const copied = await generateWeaponSnapshot({ sigWeapons: SIG_WEAPONS, stdWeapons: STD_WEAPONS, state, weaponState, versions });
      setExportMsg(copied ? '✓ copied + saved!' : '✓ saved!');
    } catch {
      setExportMsg('✕ failed');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(''), 2500);
    }
  }, [state, weaponState, versions]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-[var(--surface2)] border-b border-[var(--border)] rounded-t-2xl">
          {/* View toggle */}
          <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-md overflow-hidden flex-shrink-0">
            {(['gallery', 'list'] as WeaponView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="text-[11px] font-mono px-3 py-1.5 transition-all"
                style={{
                  background: view === v ? 'rgba(245,216,138,0.1)' : 'transparent',
                  color:      view === v ? '#f5d88a' : 'var(--subtext)',
                }}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {exportMsg && (
              <span className={`text-[11px] font-mono ${exportMsg.startsWith('✓') ? 'text-[var(--got)]' : 'text-[var(--havoc)]'}`}>
                {exportMsg}
              </span>
            )}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-[11px] font-mono font-semibold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
              style={{ borderColor: 'rgba(245,216,138,0.4)', color: '#f5d88a', background: 'rgba(245,216,138,0.08)' }}
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

        {/* Stats */}
        <div className="flex items-center gap-6 px-4 py-2.5 border-b border-[var(--border)]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-semibold" style={{ color: '#f5d88a' }}>{owned.length}/{allWeapons.length}</span>
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wide">weapons owned</span>
          </div>
        </div>

        {/* Preview */}
        <div className="overflow-y-auto p-4">
          {owned.length === 0 ? (
            <p className="text-xs text-[var(--subtext)] font-mono">No weapons owned yet.</p>
          ) : view === 'gallery' ? (
            <GalleryPreview owned={owned} getRank={getRank} />
          ) : (
            <ListView owned={owned} getRank={getRank} />
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryPreview({ owned, getRank }: { owned: Weapon[]; getRank: (w: Weapon) => number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {owned.map(w => {
          const rank  = getRank(w);
          const isMax = rank === 5;
          return (
            <div
              key={w.file}
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{ width: 90, height: 130, border: `1px solid rgba(245,216,138,0.38)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`weapons/${w.file}.avif`}
                alt={w.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.05'; }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(8,10,14,0.93) 100%)' }} />
              <div className="absolute bottom-0 inset-x-0 px-1.5 pb-1.5">
                {w.owner && (
                  <p className="text-[8px] font-mono leading-none mb-0.5 truncate" style={{ color: 'rgba(245,216,138,0.55)' }}>
                    {w.owner.replace(/_/g, ' ')}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  <p className="text-[9px] font-semibold leading-tight truncate flex-1 min-w-0" style={{ color: '#f5f0e8' }}>
                    {w.name}
                  </p>
                  <div
                    className="flex rounded px-1 py-0.5 flex-shrink-0"
                    style={{ background: 'rgba(13,13,25,0.88)', border: `0.75px solid ${isMax ? 'rgba(245,216,138,0.65)' : 'rgba(245,216,138,0.2)'}` }}
                  >
                    <span className="text-[8px] font-mono font-bold" style={{ color: '#f5d88a' }}>R{rank}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ owned, getRank }: { owned: Weapon[]; getRank: (w: Weapon) => number }) {
  return (
    <div>
      <div className="flex flex-col gap-1.5">
        {owned.map(w => {
          const rank = getRank(w);
          return (
            <div
              key={w.file}
              className="flex items-center gap-3 px-3 py-2 rounded-xl border"
              style={{ background: 'rgba(245,216,138,0.04)', borderColor: 'rgba(245,216,138,0.22)' }}
            >
              {/* Thumb */}
              <div className="relative rounded-lg overflow-hidden flex-shrink-0" style={{ width: 40, height: 40 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`weapons/${w.file}.avif`}
                  alt={w.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.05'; }}
                />
              </div>
              {/* Name + owner */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#e8e3f0' }}>{w.name}</p>
                {w.owner && (
                  <p className="text-[10px] font-mono truncate" style={{ color: 'rgba(245,216,138,0.5)' }}>
                    {w.owner.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
              {/* Rank badge */}
              <div
                className="flex-shrink-0 px-2 py-0.5 rounded border text-[11px] font-mono font-bold"
                style={{
                  background:  rank === 5 ? 'rgba(13,13,25,0.88)' : 'rgba(245,216,138,0.12)',
                  borderColor: rank === 5 ? 'rgba(245,216,138,0.65)' : 'rgba(245,216,138,0.35)',
                  color: '#f5d88a',
                }}
              >
                R{rank}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
