import { useRef, useState, useEffect, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';
import type { Resonator } from '@/types';

interface Props { entry: Resonator; }

export default function TrackerEntry({ entry }: Props) {
  const { id, name, element } = entry;
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

  return (
    <div className="tracker-card-wrap flex flex-col" style={{ width: 128 }}>
      {/* ── Art card ── */}
      <div
        onClick={() => setRes(id, !s.res)}
        className="relative rounded-xl overflow-hidden cursor-pointer transition-all duration-150 select-none"
        style={{
          height: 196,
          border: `1px solid ${s.res ? 'rgba(245,216,138,0.38)' : 'rgba(54,60,71,0.6)'}`,
          boxShadow: s.res ? '0 0 10px rgba(245,216,138,0.08)' : 'none',
        }}
      >
        {/* Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`art/art_${slug}.avif`}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: s.res ? 1 : 0.22 }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = `icons/head_${slug}.webp`; }}
        />

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 28%, rgba(6,8,12,0.94) 100%)' }}
        />

        {/* Element icon — top-left, no bg, bigger */}
        {element && (
          <div className="absolute top-1.5 left-1.5 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${element}.webp`}
              alt={element}
              className="w-5 h-5 object-contain drop-shadow-md"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        {/* Priority button — top-right of card */}
        <button
          onClick={(e) => { e.stopPropagation(); if (!s.res) togglePriority(id); }}
          title="Priority"
          className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded text-[8px] font-mono font-bold border flex items-center justify-center transition-all"
          style={{
            background:  isPrioritized ? 'rgba(168,125,16,0.35)' : 'rgba(13,13,25,0.65)',
            borderColor: isPrioritized ? 'rgba(245,216,138,0.6)' : 'rgba(255,255,255,0.12)',
            color:       isPrioritized ? '#f5d88a'               : 'rgba(255,255,255,0.35)',
            opacity:     s.res ? 0.3 : 1,
            cursor:      s.res ? 'default' : 'pointer',
          }}
        >
          P
        </button>

        {/* Name — bottom */}
        <div className="absolute bottom-0 inset-x-0 px-1.5 pb-1.5 z-10">
          <p
            className="text-[9px] font-semibold leading-tight truncate"
            style={{ color: s.res ? '#f5f0e8' : 'rgba(255,255,255,0.22)' }}
          >
            {name}
          </p>
        </div>
      </div>

      {/* ── S / R controls — only when owned ── */}
      {s.res && (
        <div className="flex items-center gap-1 mt-1 px-0.5">
        {/* Sequence */}
        <div ref={seqRef} className="relative flex-1">
          <button
            onClick={(e) => { e.stopPropagation(); setWepOpen(false); setSeqOpen(v => !v); }}
            className="w-full h-5 rounded text-[8px] font-mono font-semibold border flex items-center justify-center transition-all"
            style={{
              background:  s.seq > 0 ? 'rgba(13,13,25,0.88)' : 'var(--surface2)',
              borderColor: s.seq > 0 ? (isMaxS ? 'rgba(245,216,138,0.65)' : 'rgba(245,216,138,0.35)') : 'var(--border)',
              color:       s.seq > 0 ? '#f5d88a' : 'var(--subtext)',
            }}
          >
            S{s.seq > 0 ? s.seq : ''}
          </button>
          {s.res && (
            <div className={`seq-panel ${seqOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', left: 0, right: 'auto' }}>
              <span className="text-[9px] font-mono text-subtext mr-1">seq</span>
              {Array.from({ length: 7 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleSeq(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.seq === i ? 'rgba(245,216,138,0.15)' : 'transparent',
                    color:       s.seq === i ? '#f5d88a'               : 'var(--subtext)',
                    borderColor: s.seq === i ? 'rgba(245,216,138,0.5)' : 'transparent',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weapon rank */}
        <div ref={wepRef} className="relative flex-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSeqOpen(false); setWepOpen(v => !v); }}
            className="w-full h-5 rounded text-[8px] font-mono font-semibold border flex items-center justify-center transition-all"
            style={{
              background:  s.wep > 0 ? 'rgba(13,13,25,0.88)' : 'var(--surface2)',
              borderColor: s.wep > 0 ? (isMaxR ? 'rgba(245,216,138,0.65)' : 'rgba(245,216,138,0.35)') : 'var(--border)',
              color:       s.wep > 0 ? '#f5d88a' : 'var(--subtext)',
            }}
          >
            R{s.wep > 0 ? s.wep : ''}
          </button>
          {s.res && (
            <div className={`wep-panel ${wepOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', left: 0, right: 'auto' }}>
              <span className="text-[9px] font-mono text-sig mr-1">rank</span>
              {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
                <button
                  key={i}
                  onClick={() => handleWep(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.wep === i ? 'rgba(245,216,138,0.15)' : 'transparent',
                    color:       s.wep === i ? '#f5d88a'               : 'var(--subtext)',
                    borderColor: s.wep === i ? 'rgba(245,216,138,0.5)' : 'transparent',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
