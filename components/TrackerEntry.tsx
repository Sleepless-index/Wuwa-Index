import { useRef, useState, useEffect, useCallback } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { toImageSlug } from '@/utils/helpers';
import type { Resonator } from '@/types';

interface Props {
  entry: Resonator;
}

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
    <div
      className="relative flex-shrink-0 rounded-xl transition-all duration-150"
      style={{
        width: 96,
        height: 148,
        border: `1px solid ${s.res ? 'rgba(126,184,247,0.35)' : 'rgba(54,60,71,0.7)'}`,
      }}
    >
      {/* Art */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`art/art_${slug}.avif`}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover rounded-xl pointer-events-none"
        style={{ opacity: s.res ? 1 : 0.22 }}
        onError={e => {
          (e.currentTarget as HTMLImageElement).src = `icons/head_${slug}.webp`;
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(8,10,14,0.92) 100%)' }}
      />

      {/* Priority button — top-left */}
      <button
        onClick={() => togglePriority(id)}
        disabled={s.res}
        title="Priority"
        className="absolute top-1.5 left-1.5 w-5 h-5 rounded text-[9px] font-mono font-bold border flex items-center justify-center transition-all z-10"
        style={{
          background:  isPrioritized ? 'rgba(168,125,16,0.3)' : 'rgba(13,13,25,0.72)',
          borderColor: isPrioritized ? 'rgba(168,125,16,0.65)' : 'rgba(255,255,255,0.1)',
          color:       isPrioritized ? '#f5d88a' : 'rgba(255,255,255,0.38)',
          opacity:     s.res ? 0.35 : 1,
        }}
      >
        P
      </button>

      {/* Checkbox — top-right */}
      <label className="absolute top-1.5 right-1.5 z-10 cursor-pointer" title={s.res ? 'Mark not owned' : 'Mark owned'}>
        <input
          type="checkbox"
          checked={s.res}
          onChange={e => setRes(id, e.target.checked)}
          className="cb"
          style={{ width: 14, height: 14 }}
        />
      </label>

      {/* Element icon badge — top-centre (only when owned) */}
      {s.res && element && (
        <div
          className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 rounded px-1 py-0.5 flex items-center"
          style={{ background: `${elColor}22`, border: `0.75px solid ${elColor}55` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`icons/icon_${element}.webp`}
            alt=""
            className="w-2.5 h-2.5 object-contain"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 inset-x-0 px-1.5 pb-1.5 z-10">
        <p
          className="text-[9px] font-semibold leading-tight truncate mb-1"
          style={{ color: s.res ? '#f5f0e8' : 'rgba(255,255,255,0.22)' }}
        >
          {name}
        </p>

        <div className="flex gap-1 items-center">
          {/* Sequence */}
          <div ref={seqRef} className="relative">
            <button
              onClick={() => { setWepOpen(false); setSeqOpen(v => !v); }}
              className="h-4 min-w-[18px] px-1 rounded text-[8px] font-mono font-semibold border flex items-center justify-center transition-all"
              style={{
                background:  s.seq > 0 ? 'rgba(196,160,245,0.15)' : 'rgba(13,13,25,0.72)',
                borderColor: s.seq > 0 ? 'rgba(196,160,245,0.5)'  : 'rgba(255,255,255,0.1)',
                color:       s.seq > 0 ? (isMaxS ? '#f5d88a' : '#c4a0f5') : 'rgba(255,255,255,0.32)',
              }}
            >
              S{s.seq > 0 ? s.seq : ''}
            </button>
            <div className={`seq-panel ${seqOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', right: 0 }}>
              <span className="text-[9px] font-mono text-subtext mr-1">seq</span>
              {Array.from({ length: 7 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleSeq(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.seq === i ? 'rgba(196,160,245,0.2)' : 'transparent',
                    color:       s.seq === i ? '#c4a0f5'               : 'var(--subtext)',
                    borderColor: s.seq === i ? 'rgba(196,160,245,0.5)' : 'transparent',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Weapon rank */}
          <div ref={wepRef} className="relative">
            <button
              onClick={() => { setSeqOpen(false); setWepOpen(v => !v); }}
              className="h-4 min-w-[18px] px-1 rounded text-[8px] font-mono font-semibold border flex items-center justify-center transition-all"
              style={{
                background:  s.wep > 0 ? 'rgba(126,184,247,0.15)' : 'rgba(13,13,25,0.72)',
                borderColor: s.wep > 0 ? 'rgba(126,184,247,0.5)'  : 'rgba(255,255,255,0.1)',
                color:       s.wep > 0 ? (isMaxR ? '#f5d88a' : '#7eb8f7') : 'rgba(255,255,255,0.32)',
              }}
            >
              R{s.wep > 0 ? s.wep : ''}
            </button>
            <div className={`wep-panel ${wepOpen ? 'open' : ''}`} style={{ bottom: 'calc(100% + 4px)', top: 'auto', right: 0 }}>
              <span className="text-[9px] font-mono text-sig mr-1">rank</span>
              {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
                <button
                  key={i}
                  onClick={() => handleWep(i)}
                  className="w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all border"
                  style={{
                    background:  s.wep === i ? 'rgba(126,184,247,0.2)' : 'transparent',
                    color:       s.wep === i ? '#7eb8f7'               : 'var(--subtext)',
                    borderColor: s.wep === i ? 'rgba(126,184,247,0.5)' : 'transparent',
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
