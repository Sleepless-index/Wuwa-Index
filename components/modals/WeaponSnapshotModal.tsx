import { useState, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import { WEP_ICONS } from '@/data/resonators';
import { generateWeaponSnapshot } from '@/utils/snapshot';
import { toImageSlug } from '@/utils/helpers';
import type { Weapon } from '@/data/weapons';

type WeaponView = 'gallery' | 'list';

export default function WeaponSnapshotModal({ onClose }: { onClose: () => void }) {
  const versions     = useTrackerStore(s => s.versions);
  const state        = useTrackerStore(s => s.state);
  const weaponState  = useTrackerStore(s => s.weaponState);

  const [view,        setView]        = useState<WeaponView>('gallery');
  const [showNotOwned, setShowNotOwned] = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [exportMsg,   setExportMsg]   = useState('');

  const allEntries = versions.flatMap(g => g.entries);
  const allWeapons = [...SIG_WEAPONS, ...STD_WEAPONS];

  const getRank = (w: Weapon): number => {
    if (w.owner) {
      const e = allEntries.find(e => toImageSlug(e.name) === toImageSlug(w.owner!));
      return e ? (state[e.id]?.wep ?? 0) : 0;
    }
    return weaponState[w.file] ?? 0;
  };

  const owned    = allWeapons.filter(w => getRank(w) > 0);
  const notOwned = allWeapons.filter(w => getRank(w) === 0);

  const handleExport = useCallback(async () => {
    setExporting(true); setExportMsg('');
    try {
      const copied = await generateWeaponSnapshot({
        sigWeapons: SIG_WEAPONS, stdWeapons: STD_WEAPONS,
        state, weaponState, versions,
      });
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

          {/* Not owned toggle — list only */}
          {view === 'list' && (
            <button
              onClick={() => setShowNotOwned(v => !v)}
              className="text-[11px] font-mono px-2.5 py-1.5 rounded-md border transition-all flex-shrink-0"
              style={{
                background:  showNotOwned ? 'rgba(245,216,138,0.08)' : 'transparent',
                borderColor: showNotOwned ? 'rgba(245,216,138,0.4)' : 'var(--border)',
                color:       showNotOwned ? '#f5d88a' : 'var(--subtext)',
              }}
            >
              not owned
            </button>
          )}

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
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--subtext)] hover:text-[var(--text)] transition-all"
            >
              close
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 px-4 py-2.5 border-b border-[var(--border)]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-mono font-semibold" style={{ color: '#f5d88a' }}>
              {owned.length}/{allWeapons.length}
            </span>
            <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wide">weapons owned</span>
          </div>
        </div>

        {/* Preview */}
        <div className="overflow-y-auto p-4">
          {view === 'gallery' ? (
            <GalleryPreview owned={owned} getRank={getRank} />
          ) : (
            <ListView owned={owned} notOwned={showNotOwned ? notOwned : []} getRank={getRank} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Gallery — owned only ── */
function GalleryPreview({ owned, getRank }: { owned: Weapon[]; getRank: (w: Weapon) => number }) {
  if (owned.length === 0) return <p className="text-xs text-[var(--subtext)] font-mono">No weapons owned yet.</p>;

  const sigOwned = owned.filter(w => w.owner !== null);
  const stdOwned = owned.filter(w => w.owner === null);

  return (
    <div className="flex flex-col gap-6">
      {sigOwned.length > 0 && (
        <div>
          <p className="text-[10px] font-mono font-semibold text-[var(--subtext)] uppercase tracking-widest mb-2">Signature</p>
          <WeaponCards entries={sigOwned} getRank={getRank} />
        </div>
      )}
      {stdOwned.length > 0 && (
        <div>
          <p className="text-[10px] font-mono font-semibold text-[var(--subtext)] uppercase tracking-widest mb-2">Standard</p>
          <WeaponCards entries={stdOwned} getRank={getRank} />
        </div>
      )}
    </div>
  );
}

function WeaponCards({ entries, getRank }: { entries: Weapon[]; getRank: (w: Weapon) => number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(w => {
        const rank = getRank(w);
        return (
          <div
            key={w.file}
            className="relative rounded-xl overflow-hidden flex-shrink-0"
            style={{ width: 90, height: 130, border: '1px solid rgba(245,216,138,0.38)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`weapons/${w.file}.avif`}
              alt={w.name}
              className="absolute inset-0 w-full h-full object-contain"
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
                  style={{ background: 'rgba(13,13,25,0.88)', border: `0.75px solid ${rank === 5 ? 'rgba(245,216,138,0.65)' : 'rgba(245,216,138,0.2)'}` }}
                >
                  <span className="text-[8px] font-mono font-bold" style={{ color: '#f5d88a' }}>R{rank}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── List — columns by weapon type, owned + optional not-owned ── */
const CATEGORIES = ['Broadblade', 'Sword', 'Pistol', 'Gauntlet', 'Rectifier'] as const;

function ListView({ owned, notOwned, getRank }: { owned: Weapon[]; notOwned: Weapon[]; getRank: (w: Weapon) => number }) {
  const showNotOwned = notOwned.length > 0;

  const cols = CATEGORIES.map(cat => ({
    label:      cat,
    icon:       WEP_ICONS[cat],
    owned:      owned.filter(w => w.category === cat),
    notOwned:   notOwned.filter(w => w.category === cat),
  })).filter(c => c.owned.length > 0 || (showNotOwned && c.notOwned.length > 0));

  if (cols.length === 0) return <p className="text-xs text-[var(--subtext)] font-mono">No weapons owned yet.</p>;

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {cols.map(({ label, icon, owned: ownedInCat, notOwned: notOwnedInCat }, ci) => (
        <div
          key={label}
          className="flex-shrink-0 min-w-[150px]"
          style={{
            borderRight: ci < cols.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            paddingRight: ci < cols.length - 1 ? 12 : 0,
            paddingLeft: ci === 0 ? 0 : 12,
          }}
        >
          {/* Column header */}
          <div className="flex items-center gap-1.5 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt={label} className="w-3.5 h-3.5 object-contain opacity-60"
              onError={e => (e.currentTarget.style.display = 'none')} />
            <span className="text-[9px] font-mono font-bold text-[var(--subtext)] uppercase tracking-wider">{label}</span>
            <span className="text-[9px] font-mono text-[var(--muted)]">{ownedInCat.length}/{ownedInCat.length + notOwnedInCat.length}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            {ownedInCat.map(w => <WeaponRow key={w.file} weapon={w} rank={getRank(w)} owned />)}
            {notOwnedInCat.map(w => <WeaponRow key={w.file} weapon={w} rank={0} owned={false} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeaponRow({ weapon, rank, owned }: { weapon: Weapon; rank: number; owned: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-1.5 rounded-lg"
      style={{
        height:     28,
        background: owned ? 'rgba(245,216,138,0.04)' : 'transparent',
        border:     owned ? '0.75px solid rgba(245,216,138,0.2)' : '0.75px solid transparent',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`weapons/${weapon.file}.avif`}
        alt=""
        className="object-contain flex-shrink-0 rounded"
        style={{ width: 20, height: 20, opacity: owned ? 1 : 0.3 }}
        onError={e => (e.currentTarget.style.display = 'none')}
      />
      <span className="flex-1 truncate text-[10px] font-medium" style={{ color: owned ? 'var(--text)' : 'var(--muted)' }}>
        {weapon.name}
      </span>
      {owned && (
        <span
          className="flex-shrink-0 flex rounded px-1 py-0.5"
          style={{ background: 'rgba(13,13,25,0.7)', border: `0.5px solid ${rank === 5 ? 'rgba(245,216,138,0.5)' : 'rgba(245,216,138,0.15)'}` }}
        >
          <span className="text-[8px] font-mono font-bold" style={{ color: '#f5d88a' }}>R{rank}</span>
        </span>
      )}
    </div>
  );
}
