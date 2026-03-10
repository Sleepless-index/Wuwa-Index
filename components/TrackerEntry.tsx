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
  const entryState    = useTrackerStore(s => s.state[id]);
  const isPrioritized = useTrackerStore(s => s.priority.includes(id));
  const setRes        = useTrackerStore(s => s.setRes);
  const setSeq        = useTrackerStore(s => s.setSeq);
  const setWep        = useTrackerStore(s => s.setWep);
  const togglePriority = useTrackerStore(s => s.togglePriority);

  const s      = entryState ?? { res: false, sig: false, seq: 0, wep: 0 };
  const elColor = element ? EL_COLORS[element] : undefined;
  const slug    = toImageSlug(name);

  const [seqOpen, setSeqOpen] = useState(false);
  const [wepOpen, setWepOpen] = useState(false);
  const seqRef = useRef<HTMLDivElement>(null);
  const wepRef = useRef<HTMLDivElement>(null);

  // Close panels on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (seqRef.current && !seqRef.current.contains(e.target as Node)) setSeqOpen(false);
      if (wepRef.current && !wepRef.current.contains(e.target as Node)) setWepOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSeq = useCallback((val: number) => {
    setSeq(id, val);
    setSeqOpen(false);
  }, [id, setSeq]);

  const handleWep = useCallback((val: number) => {
    setWep(id, val);
    setWepOpen(false);
  }, [id, setWep]);

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150
        ${s.res
          ? 'bg-got/5 border-got/20'
          : 'bg-surface border-border hover:border-subtext/40'}
      `}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={s.res}
        onChange={e => setRes(id, e.target.checked)}
        className="cb"
      />

      {/* Head icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`icons/head_${slug}.webp`}
        alt=""
        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        onError={e => (e.currentTarget.style.display = 'none')}
      />

      {/* Name + element badge */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
        <span className={`text-sm font-medium truncate ${s.res ? 'text-text' : 'text-subtext'}`}>
          {name}
        </span>
        {element && (
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ color: elColor, background: `${elColor}18` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`icons/icon_${element}.webp`}
              alt=""
              className="w-3 h-3 object-contain"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            {element}
          </span>
        )}
      </div>

      {/* Sequence button + panel */}
      <div ref={seqRef} className="relative">
        <button
          onClick={() => { setWepOpen(false); setSeqOpen(v => !v); }}
          className={`
            h-5 min-w-[20px] px-1.5 rounded text-[10px] font-mono font-semibold
            border transition-all flex items-center justify-center
            ${s.seq > 0
              ? 'bg-electro/10 border-electro/40 text-electro'
              : 'bg-transparent border-border text-subtext hover:border-subtext'}
          `}
        >
          S{s.seq > 0 ? s.seq : ''}
        </button>
        <div className={`seq-panel ${seqOpen ? 'open' : ''}`}>
          <span className="text-[9px] font-mono text-subtext mr-1">seq</span>
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleSeq(i)}
              className={`
                w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all
                ${s.seq === i
                  ? 'bg-electro/20 text-electro border border-electro/50'
                  : 'text-subtext hover:text-text hover:bg-surface border border-transparent'}
              `}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Weapon rank button + panel */}
      <div ref={wepRef} className="relative">
        <button
          onClick={() => { setSeqOpen(false); setWepOpen(v => !v); }}
          className={`
            h-5 min-w-[20px] px-1.5 rounded text-[10px] font-mono font-semibold
            border transition-all flex items-center justify-center
            ${s.wep > 0
              ? 'bg-sig/10 border-sig/40 text-sig'
              : 'bg-transparent border-border text-subtext hover:border-subtext'}
          `}
        >
          R{s.wep > 0 ? s.wep : ''}
        </button>
        <div className={`wep-panel ${wepOpen ? 'open' : ''}`}>
          <span className="text-[9px] font-mono text-sig mr-1">rank</span>
          {Array.from({ length: 5 }, (_, i) => i + 1).map(i => (
            <button
              key={i}
              onClick={() => handleWep(i)}
              className={`
                w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all
                ${s.wep === i
                  ? 'bg-sig/20 text-sig border border-sig/50'
                  : 'text-subtext hover:text-text hover:bg-surface border border-transparent'}
              `}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Priority button */}
      <button
        onClick={() => togglePriority(id)}
        disabled={s.res}
        title="Priority"
        className={`
          h-5 w-5 rounded text-[10px] font-mono font-bold border transition-all flex items-center justify-center
          ${isPrioritized
            ? 'bg-wish/15 border-wish/50 text-wish'
            : 'border-border text-subtext hover:border-subtext disabled:opacity-30'}
        `}
      >
        P
      </button>
    </div>
  );
}
