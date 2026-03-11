import { useRef, useState, useEffect } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { toImageSlug } from '@/utils/helpers';
import type { Weapon } from '@/data/weapons';

interface Props { weapon: Weapon; }

export default function WeaponEntry({ weapon }: Props) {
  const { file, name, owner } = weapon;
  const isSig = owner !== null;

  const versions         = useTrackerStore(s => s.versions);
  const state            = useTrackerStore(s => s.state);
  const setWep           = useTrackerStore(s => s.setWep);
  const weaponState      = useTrackerStore(s => s.weaponState);
  const setStdWeaponRank = useTrackerStore(s => s.setStdWeaponRank);

  const ownerEntry = isSig
    ? versions.flatMap(g => g.entries).find(e =>
        toImageSlug(e.name) === toImageSlug(owner!)
      )
    : null;

  const ownerState = ownerEntry ? state[ownerEntry.id] : null;
  const rank   = isSig ? (ownerState?.wep ?? 0) : (weaponState[file] ?? 0);
  const owned  = rank > 0;
  const isMaxR = rank === 5;

  const [rankOpen, setRankOpen] = useState(false);
  const rankRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rankRef.current && !rankRef.current.contains(e.target as Node)) setRankOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (isSig && ownerEntry) setWep(ownerEntry.id, rank > 0 ? 0 : 1);
    else if (!isSig) setStdWeaponRank(file, rank > 0 ? 0 : 1);
  };

  const handleRank = (val: number) => {
    if (isSig && ownerEntry) setWep(ownerEntry.id, val);
    else setStdWeaponRank(file, val);
    setRankOpen(false);
  };

  return (
    <div className="tracker-card-wrap flex flex-col" style={{ width: 128 }}>
      <div
        onClick={handleToggle}
        className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-150 select-none"
        style={{
          height: 196,
          border: `1px solid ${owned ? 'rgba(76,123,214,0.38)' : 'rgba(54,60,71,0.6)'}`,
          boxShadow: owned ? '0 0 10px rgba(76,123,214,0.08)' : 'none',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`weapons/${file}.avif`}
          alt={name}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ opacity: owned ? 1 : 0.22 }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.05'; }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 28%, rgba(6,8,12,0.94) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 z-10">
          {isSig && owner && (
            <p className="text-[8px] font-mono text-wish/70 leading-none mb-0.5 truncate">
              {owner.replace(/_/g, ' ')}
            </p>
          )}
          <p className="text-[10px] font-semibold leading-tight truncate"
            style={{ color: owned ? '#e8e3f0' : 'var(--subtext)' }}>
            {name}
          </p>
        </div>
      </div>

      {owned && (
        <div className="mt-1 px-0.5">
          <div ref={rankRef} className="relative">
            <button
              onClick={e => { e.stopPropagation(); setRankOpen(v => !v); }}
              className="w-full h-5 rounded text-[8px] font-mono font-semibold border flex items-center justify-center transition-all"
              style={{
                background:  isMaxR ? 'rgba(8,12,24,0.92)' : 'rgba(76,123,214,0.12)',
                borderColor: isMaxR ? 'rgba(76,123,214,0.65)' : 'rgba(76,123,214,0.35)',
                color: '#4c7bd6',
              }}
            >
              R{rank}
            </button>
            <div className={`wep-panel ${rankOpen ? 'open' : ''}`}
              style={{ bottom: 'calc(100% + 4px)', top: 'auto', left: 0, right: 'auto' }}>
              <span className="text-[9px] font-mono text-sig mr-1">rank</span>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => handleRank(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  rank === i ? 'rgba(76,123,214,0.2)' : 'transparent',
                    color:       rank === i ? '#4c7bd6' : 'var(--subtext)',
                    borderColor: rank === i ? 'rgba(76,123,214,0.5)' : 'transparent',
                  }}
                >{i}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
