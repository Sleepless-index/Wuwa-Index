import { useRef, useState, useEffect, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS, WEP_ICONS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';
import type { Resonator } from '@/types';

interface Props { entry: Resonator; }

export default function TrackerEntry({ entry }: Props) {
  const { id, name, element, weaponType } = entry;
  const entryState     = useTrackerStore(s => s.state[id]);
  const isPrioritized  = useTrackerStore(s => s.priority.includes(id));
  const setRes         = useTrackerStore(s => s.setRes);
  const setSeq         = useTrackerStore(s => s.setSeq);
  const setWep         = useTrackerStore(s => s.setWep);
  const togglePriority = useTrackerStore(s => s.togglePriority);

  const s       = entryState ?? { res: false, sig: false, seq: 0, wep: 0 };
  const elColor = element ? EL_COLORS[element] : undefined;
  const slug    = toImageSlug(name);

  const [seqOpen, setSeqOpen] = useState(false);
  const [wepOpen, setWepOpen] = useState(false);
  const seqRef = useRef<HTMLDivElement>(null);
  const wepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (seqRef.current && !seqRef.current.contains(e.target as Node)) setSeqOpen(false);
      if (wepRef.current && !wepRef.current.contains(e.target as Node)) setWepOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSeq = useCallback((val: number) => { setSeq(id, val); setSeqOpen(false); }, [id, setSeq]);
  const handleWep = useCallback((val: number) => { setWep(id, val); setWepOpen(false); }, [id, setWep]);

  const isMaxS = s.seq === 6;
  const isMaxR = s.wep === 5;

  const borderColor = s.res ? 'rgba(245,216,138,0.3)' : 'rgba(30,34,44,0.95)';
  const glowColor   = s.res ? 'rgba(245,216,138,0.06)' : 'none';

  return (
    <div className="tracker-card-wrap flex flex-col" style={{ width: 128 }}>
      {/* ── Art card ── */}
      <div
        onClick={() => setRes(id, !s.res)}
        className="relative rounded-xl overflow-hidden cursor-pointer select-none"
        style={{
          height: 196,
          border: `1px solid ${borderColor}`,
          boxShadow: s.res ? `0 0 14px ${glowColor}, 0 4px 16px rgba(0,0,0,0.5)` : '0 2px 8px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`art/art_${slug}.avif`}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{
            opacity: s.res ? 1 : 0.18,
            transition: 'opacity 0.2s',
            transform: s.res ? 'scale(1)' : 'scale(0.98)',
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = `icons/head_${slug}.webp`; }}
        />

        {/* Dark vignette overlay (not-owned state) */}
        {!s.res && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(8,10,14,0.45)' }} />
        )}

        {/* Bottom gradient — deeper */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(6,8,12,0.5) 55%, rgba(4,5,10,0.97) 100%)' }}
        />

        {/* Element color accent bar at top */}
        {s.res && elColor && (
          <div className="absolute top-0 inset-x-0 h-0.5 pointer-events-none"
            style={{ background: `linear-gradient(to right, transparent, ${elColor}90, transparent)` }} />
        )}

        {/* Element icon — top-left */}
        {element && (
          <div className="absolute top-2 left-2 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${element}.webp`}
              alt={element}
              className="w-4 h-4 object-contain"
              style={{
                filter: s.res
                  ? `drop-shadow(0 0 4px ${elColor}aa) drop-shadow(0 1px 2px rgba(0,0,0,0.8))`
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.8)) grayscale(0.6)',
                opacity: s.res ? 1 : 0.45,
              }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        {/* Priority button — top-right */}
        {!s.res && (
          <button
            onClick={(e) => { e.stopPropagation(); togglePriority(id); }}
            title="Priority"
            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-md text-[7px] font-mono font-bold border flex items-center justify-center transition-all"
            style={{
              background:  isPrioritized ? 'rgba(168,125,16,0.4)' : 'rgba(10,10,18,0.7)',
              borderColor: isPrioritized ? 'rgba(245,216,138,0.65)' : 'rgba(255,255,255,0.1)',
              color:       isPrioritized ? '#f5d88a' : 'rgba(255,255,255,0.3)',
            }}
          >
            P
          </button>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 px-2 pb-2 z-10">
          {/* Weapon icon + name row */}
          <div className="flex items-end gap-1">
            {weaponType && WEP_ICONS[weaponType] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={WEP_ICONS[weaponType]}
                alt={weaponType}
                className="w-3 h-3 object-contain flex-shrink-0 mb-0.5"
                style={{ opacity: s.res ? 0.55 : 0.25 }}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
            <p
              className="text-[9.5px] font-semibold leading-tight truncate flex-1"
              style={{ color: s.res ? '#f0ede8' : 'rgba(255,255,255,0.18)' }}
            >
              {name}
            </p>
          </div>
        </div>
      </div>

      {/* ── S / R controls — only when owned ── */}
      {s.res && (
        <div className="flex items-center gap-1 mt-1.5 px-0.5">
          {/* Sequence */}
          <div ref={seqRef} className="relative flex-1">
            <button
              onClick={(e) => { e.stopPropagation(); setWepOpen(false); setSeqOpen(v => !v); }}
              className="w-full h-6 rounded-lg text-[9px] font-mono font-bold border flex items-center justify-center transition-all"
              style={{
                background:  s.seq > 0 ? 'rgba(245,216,138,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: s.seq > 0 ? isMaxS ? 'rgba(245,216,138,0.6)' : 'rgba(245,216,138,0.3)' : 'var(--border)',
                color:       s.seq > 0 ? '#f5d88a' : 'var(--muted)',
              }}
            >
              S{s.seq > 0 ? s.seq : '—'}
            </button>
            <div className={`seq-panel ${seqOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', left: 0, right: 'auto' }}>
              <span className="text-[9px] font-mono text-subtext mr-1">seq</span>
              {Array.from({ length: 7 }, (_, i) => (
                <button key={i} onClick={() => handleSeq(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.seq === i ? 'rgba(245,216,138,0.15)' : 'transparent',
                    color:       s.seq === i ? '#f5d88a' : 'var(--subtext)',
                    borderColor: s.seq === i ? 'rgba(245,216,138,0.5)' : 'transparent',
                  }}
                >{i}</button>
              ))}
            </div>
          </div>

          {/* Weapon rank */}
          <div ref={wepRef} className="relative flex-1">
            <button
              onClick={(e) => { e.stopPropagation(); setSeqOpen(false); setWepOpen(v => !v); }}
              className="w-full h-6 rounded-lg text-[9px] font-mono font-bold border flex items-center justify-center transition-all"
              style={{
                background:  s.wep > 0 ? 'rgba(245,216,138,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: s.wep > 0 ? isMaxR ? 'rgba(245,216,138,0.6)' : 'rgba(245,216,138,0.3)' : 'var(--border)',
                color:       s.wep > 0 ? '#f5d88a' : 'var(--muted)',
              }}
            >
              R{s.wep > 0 ? s.wep : '—'}
            </button>
            <div className={`wep-panel ${wepOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', left: 0, right: 'auto' }}>
              <span className="text-[9px] font-mono text-wish mr-1">rank</span>
              {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
                <button key={i} onClick={() => handleWep(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.wep === i ? 'rgba(245,216,138,0.15)' : 'transparent',
                    color:       s.wep === i ? '#f5d88a' : 'var(--subtext)',
                    borderColor: s.wep === i ? 'rgba(245,216,138,0.5)' : 'transparent',
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
