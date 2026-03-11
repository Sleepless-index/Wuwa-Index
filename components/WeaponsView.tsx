import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import { toImageSlug } from '@/utils/helpers';
import WeaponEntry from './WeaponEntry';

type WeaponView = 'gallery' | 'list';

function WeaponListRow({ weapon }: { weapon: typeof SIG_WEAPONS[0] }) {
  const versions        = useTrackerStore(s => s.versions);
  const state           = useTrackerStore(s => s.state);
  const weaponState     = useTrackerStore(s => s.weaponState);
  const setWep          = useTrackerStore(s => s.setWep);
  const setStdWeaponRank = useTrackerStore(s => s.setStdWeaponRank);

  const allEntries  = versions.flatMap(g => g.entries);
  const ownerEntry  = weapon.owner
    ? allEntries.find(e => toImageSlug(e.name) === toImageSlug(weapon.owner!))
    : null;
  const rank  = weapon.owner ? (ownerEntry ? (state[ownerEntry.id]?.wep ?? 0) : 0) : (weaponState[weapon.file] ?? 0);
  const owned = rank > 0;

  const toggle = () => {
    if (weapon.owner && ownerEntry) setWep(ownerEntry.id, rank > 0 ? 0 : 1);
    else if (!weapon.owner) setStdWeaponRank(weapon.file, rank > 0 ? 0 : 1);
  };

  const setRank = (val: number) => {
    if (weapon.owner && ownerEntry) setWep(ownerEntry.id, val);
    else setStdWeaponRank(weapon.file, val);
  };

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl border transition-all"
      style={{
        background:  owned ? 'rgba(245,216,138,0.05)' : 'var(--surface)',
        borderColor: owned ? 'rgba(245,216,138,0.25)' : 'var(--border)',
      }}
    >
      {/* Thumb */}
      <div
        className="relative rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
        style={{ width: 40, height: 40 }}
        onClick={toggle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`weapons/${weapon.file}.avif`}
          alt={weapon.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: owned ? 1 : 0.3 }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.05'; }}
        />
      </div>

      {/* Name + owner */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: owned ? '#e8e3f0' : 'var(--subtext)' }}>
          {weapon.name}
        </p>
        {weapon.owner && (
          <p className="text-[10px] font-mono truncate" style={{ color: 'rgba(245,216,138,0.5)' }}>
            {weapon.owner.replace(/_/g, ' ')}
          </p>
        )}
      </div>

      {/* Rank buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            onClick={() => setRank(rank === i ? 0 : i)}
            className="w-6 h-6 rounded text-[10px] font-mono font-semibold border transition-all"
            style={{
              background:  rank >= i ? 'rgba(245,216,138,0.15)' : 'transparent',
              borderColor: rank >= i ? 'rgba(245,216,138,0.45)' : 'var(--border)',
              color:       rank >= i ? '#f5d88a' : 'var(--muted)',
            }}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeaponSection({ label, weapons, view }: { label: string; weapons: typeof SIG_WEAPONS; view: WeaponView }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-3">{label}</p>
      {view === 'gallery' ? (
        <div className="card-grid flex flex-wrap gap-2">
          {weapons.map(w => <WeaponEntry key={w.file} weapon={w} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {weapons.map(w => <WeaponListRow key={w.file} weapon={w} />)}
        </div>
      )}
    </div>
  );
}

export default function WeaponsView() {
  const [view, setView] = useState<WeaponView>('gallery');

  return (
    <div className="px-4 py-4">
      {/* View toggle */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
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
      </div>

      <WeaponSection label="Signature Weapons" weapons={SIG_WEAPONS} view={view} />
      <WeaponSection label="Standard Weapons"  weapons={STD_WEAPONS} view={view} />
    </div>
  );
}
