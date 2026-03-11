import { useState } from 'react';
import { SIG_WEAPONS, STD_WEAPONS } from '@/data/weapons';
import { WEP_ORDER, WEP_ICONS } from '@/data/resonators';
import WeaponEntry from './WeaponEntry';
import type { WeaponCategory } from '@/types';

export default function WeaponsView() {
  const [activeFilter, setActiveFilter] = useState<WeaponCategory | 'All'>('All');

  const sigFiltered = SIG_WEAPONS.filter(w => activeFilter === 'All' || w.category === activeFilter);
  const stdFiltered = STD_WEAPONS.filter(w => activeFilter === 'All' || w.category === activeFilter);

  return (
    <div className="px-4 py-4">
      {/* Weapon type filter */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {WEP_ORDER.map(wt => {
          const active = activeFilter === wt;
          return (
            <button
              key={wt}
              onClick={() => setActiveFilter(active ? 'All' : wt)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all"
              style={{
                background:  active ? 'rgba(245,216,138,0.12)' : 'transparent',
                borderColor: active ? 'rgba(245,216,138,0.55)' : 'var(--border)',
                color:       active ? '#f5d88a'                : 'var(--subtext)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={WEP_ICONS[wt]}
                alt={wt}
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              {wt}
            </button>
          );
        })}
        {activeFilter !== 'All' && (
          <button
            onClick={() => setActiveFilter('All')}
            className="text-[10px] font-mono text-subtext hover:text-text px-1.5 py-1 rounded border border-transparent hover:border-border transition-all"
          >✕</button>
        )}
      </div>

      {sigFiltered.length > 0 && (
        <>
          <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-3">
            Signature Weapons
          </p>
          <div className="card-grid flex flex-wrap gap-2 mb-8">
            {sigFiltered.map(w => <WeaponEntry key={w.file} weapon={w} />)}
          </div>
        </>
      )}

      {stdFiltered.length > 0 && (
        <>
          <p className="text-[10px] font-mono font-semibold text-subtext uppercase tracking-widest mb-3">
            Standard Weapons
          </p>
          <div className="card-grid flex flex-wrap gap-2">
            {stdFiltered.map(w => <WeaponEntry key={w.file} weapon={w} />)}
          </div>
        </>
      )}
    </div>
  );
}
