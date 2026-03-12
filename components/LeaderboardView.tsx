import { useState } from 'react';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { SIG_WEAPONS } from '@/data/weapons';
import { toImageSlug } from '@/utils/helpers';

const ASTRITES_PER_PULL = 160;
const ASTRITE_ICON = 'icons/T_IconA_zcpq_UI.webp';

function AstriteIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ASTRITE_ICON} alt="astrite" width={size} height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      onError={e => (e.currentTarget.style.display = 'none')} />
  );
}

export default function LeaderboardView() {
  const versions    = useTrackerStore(s => s.versions);
  const stateMap    = useTrackerStore(s => s.state);
  const pullCounts  = useTrackerStore(s => s.pullCounts);
  const setPulls    = useTrackerStore(s => s.setPulls);

  const [editing,  setEditing]  = useState<string | null>(null);
  const [draft,    setDraft]    = useState('');
  const [showWep,  setShowWep]  = useState<Set<number>>(new Set());
  const toggleWep  = (id: number) =>
    setShowWep(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  // Exclude standard banner
  const allEntries = versions.filter(g => !g.standard).flatMap(g => g.entries);
  const owned      = allEntries.filter(e => stateMap[e.id]?.res);

  // Map sig weapons by owner slug
  const sigByOwner = Object.fromEntries(
    SIG_WEAPONS.filter(w => w.owner).map(w => [toImageSlug(w.owner!), w])
  );

  const withPulls    = owned.filter(e => (pullCounts[String(e.id)] ?? 0) > 0);
  const withoutPulls = owned.filter(e => !(pullCounts[String(e.id)] ?? 0));
  const sorted       = [...withPulls].sort((a, b) =>
    (pullCounts[String(b.id)] ?? 0) - (pullCounts[String(a.id)] ?? 0)
  );

  const totalResPulls = withPulls.reduce((s, e) => s + (pullCounts[String(e.id)] ?? 0), 0);
  const totalWepPulls = withPulls.reduce((s, e) => {
    const w = sigByOwner[toImageSlug(e.name)];
    return s + (w ? (pullCounts[`wep-${w.file}`] ?? 0) : 0);
  }, 0);
  const totalPulls    = totalResPulls + totalWepPulls;
  const totalAstrites = totalPulls * ASTRITES_PER_PULL;
  const avgAstrites   = withPulls.length > 0 ? Math.round(totalAstrites / withPulls.length) : 0;

  const startEdit  = (key: string, current?: number) => { setEditing(key); setDraft(current ? String(current) : ''); };
  const commitEdit = (key: string) => {
    const val = parseInt(draft, 10);
    setPulls(key as any, isNaN(val) ? 0 : val);
    setEditing(null); setDraft('');
  };
  const cancelEdit = () => { setEditing(null); setDraft(''); };

  return (
    <div className="px-4 py-4 pb-24 max-w-2xl mx-auto">

      {/* Summary */}
      {totalPulls > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          <StatCard label="total astrites" value={totalAstrites.toLocaleString()} icon={<AstriteIcon size={15} />} highlight />
          <StatCard label="total pulls"    value={totalPulls.toLocaleString()} />
          <StatCard label="avg per char"   value={avgAstrites.toLocaleString()} icon={<AstriteIcon size={13} />} />
        </div>
      )}

      {/* Empty state */}
      {owned.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[160px] gap-3">
          <AstriteIcon size={28} className="opacity-20" />
          <p className="text-xs font-mono text-center" style={{ color: 'var(--muted)', maxWidth: 200 }}>
            No owned characters yet — mark resonators in the Characters tab first.
          </p>
        </div>
      )}

      {/* Column headers — desktop only */}
      {sorted.length > 0 && (
        <div className="hidden md:grid grid-cols-2 gap-3 mb-1.5 px-1">
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Character</span>
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Signature Weapon</span>
        </div>
      )}

      {/* Ranked rows */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-4">
          {sorted.map((entry, idx) => {
            const resKey    = String(entry.id);
            const resPulls  = pullCounts[resKey] ?? 0;
            const elColor   = entry.element ? EL_COLORS[entry.element] : undefined;
            const slug      = toImageSlug(entry.name);
            const sigWep    = sigByOwner[slug];
            const wepKey    = sigWep ? `wep-${sigWep.file}` : null;
            const wepPulls  = wepKey ? (pullCounts[wepKey] ?? 0) : 0;
            const medal     = idx === 0 ? '#f0c060' : idx === 1 ? '#b0b0b8' : idx === 2 ? '#cd8050' : null;
            const isWepView = showWep.has(entry.id);
            const activeKey    = isWepView && wepKey ? wepKey : resKey;
            const activePulls  = isWepView && wepKey ? wepPulls : resPulls;

            return (
              <div key={entry.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">

                {/* Mobile: single card with toggle */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl md:hidden"
                  style={{ background: 'var(--surface)', border: `1px solid ${!isWepView && elColor ? `${elColor}22` : 'var(--border)'}` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: medal ? `${medal}18` : 'transparent', border: medal ? `1px solid ${medal}40` : '1px solid transparent' }}>
                    <span className="text-[10px] font-mono font-bold" style={{ color: medal ?? 'var(--muted)' }}>{idx + 1}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isWepView && sigWep ? `weapons/${sigWep.file}.avif` : `characters/Heads/head_${slug}.webp`}
                    alt="" className="w-9 h-9 rounded-xl flex-shrink-0"
                    style={{ objectFit: isWepView ? 'contain' : 'cover', border: `1.5px solid ${!isWepView && elColor ? `${elColor}44` : 'var(--border)'}`, background: isWepView ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.1'; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                      {isWepView && sigWep ? sigWep.name : entry.name}
                    </p>
                    {!isWepView && elColor && entry.element ? (
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                        style={{ color: elColor, background: `${elColor}16` }}>{entry.element}</span>
                    ) : isWepView && sigWep ? (
                      <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>{sigWep.category}</span>
                    ) : null}
                  </div>
                  {sigWep && (
                    <button onClick={() => toggleWep(entry.id)}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all mr-1"
                      title={isWepView ? 'Show character' : 'Show weapon'}
                      style={{ background: isWepView ? 'rgba(76,123,214,0.15)' : 'var(--surface2)', border: `1px solid ${isWepView ? 'rgba(76,123,214,0.4)' : 'var(--border)'}` }}>
                      {isWepView ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4c7bd6' }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--subtext)' }}>
                          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/>
                        </svg>
                      )}
                    </button>
                  )}
                  <PullButton pulls={activePulls} isEditing={editing === activeKey} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(activeKey, activePulls)} onCommit={() => commitEdit(activeKey)} onCancel={cancelEdit} />
                </div>

                {/* Desktop: character cell */}
                <div className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: 'var(--surface)', border: `1px solid ${elColor ? `${elColor}22` : 'var(--border)'}` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: medal ? `${medal}18` : 'transparent', border: medal ? `1px solid ${medal}40` : '1px solid transparent' }}>
                    <span className="text-[10px] font-mono font-bold" style={{ color: medal ?? 'var(--muted)' }}>{idx + 1}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`characters/Heads/head_${slug}.webp`} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                    style={{ border: `1.5px solid ${elColor ? `${elColor}44` : 'var(--border)'}` }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{entry.name}</p>
                    {elColor && entry.element && (
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md inline-block mt-0.5"
                        style={{ color: elColor, background: `${elColor}16` }}>{entry.element}</span>
                    )}
                  </div>
                  <PullButton pulls={resPulls} isEditing={editing === resKey} draft={draft} setDraft={setDraft}
                    onEdit={() => startEdit(resKey, resPulls)} onCommit={() => commitEdit(resKey)} onCancel={cancelEdit} />
                </div>

                {/* Desktop: weapon cell */}
                {sigWep && wepKey ? (
                  <div className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`weapons/${sigWep.file}.avif`} alt="" className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
                      style={{ border: '1.5px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}
                      onError={e => (e.currentTarget.style.display = 'none')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{sigWep.name}</p>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>{sigWep.category}</span>
                    </div>
                    <PullButton pulls={wepPulls} isEditing={editing === wepKey} draft={draft} setDraft={setDraft}
                      onEdit={() => startEdit(wepKey, wepPulls)} onCommit={() => commitEdit(wepKey)} onCancel={cancelEdit} />
                  </div>
                ) : (
                  <div className="hidden md:block rounded-xl" style={{ border: '1px dashed var(--border)', opacity: 0.3 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Not set */}
      {withoutPulls.length > 0 && owned.length > 0 && (
        <>
          {withPulls.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>not set</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            {withoutPulls.map(entry => {
              const key     = String(entry.id);
              const elColor = entry.element ? EL_COLORS[entry.element] : undefined;
              const slug    = toImageSlug(entry.name);
              return (
                <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: 'transparent', border: '1px solid var(--border)', opacity: 0.55 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`characters/Heads/head_${slug}.webp`} alt=""
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                    style={{ filter: 'grayscale(0.4)', border: `1px solid ${elColor ? `${elColor}30` : 'var(--border)'}` }}
                    onError={e => (e.currentTarget.style.display = 'none')} />
                  <span className="flex-1 text-[12px] font-medium truncate" style={{ color: 'var(--subtext)' }}>{entry.name}</span>
                  {editing === key ? (
                    <EditInput draft={draft} setDraft={setDraft} small onCommit={() => commitEdit(key)} onCancel={cancelEdit} />
                  ) : (
                    <button onClick={() => startEdit(key)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all"
                      style={{ color: 'var(--muted)', border: '1px dashed var(--border)', background: 'transparent', opacity: 1 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color='var(--subtext)'; el.style.borderColor='var(--subtext)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color='var(--muted)'; el.style.borderColor='var(--border)'; }}
                    >+ set pulls</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PullButton({ pulls, isEditing, draft, setDraft, onEdit, onCommit, onCancel }: {
  pulls: number; isEditing: boolean; draft: string; setDraft: (v: string) => void;
  onEdit: () => void; onCommit: () => void; onCancel: () => void;
}) {
  if (isEditing) return <EditInput draft={draft} setDraft={setDraft} onCommit={onCommit} onCancel={onCancel} />;
  return (
    <button onClick={onEdit}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all flex-shrink-0"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,123,214,0.35)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {pulls > 0 ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="icons/T_IconA_zcpq_UI.webp" alt="" width={15} height={15} className="object-contain flex-shrink-0"
            onError={e => (e.currentTarget.style.display = 'none')} />
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-mono font-semibold tabular-nums leading-tight" style={{ color: 'var(--text)' }}>
              {(pulls * ASTRITES_PER_PULL).toLocaleString()}
            </span>
            <span className="text-[9px] font-mono leading-none" style={{ color: 'var(--muted)' }}>{pulls} pulls</span>
          </div>
        </>
      ) : (
        <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>+ pulls</span>
      )}
    </button>
  );
}

function EditInput({ draft, setDraft, onCommit, onCancel, small }: {
  draft: string; setDraft: (v: string) => void; onCommit: () => void; onCancel: () => void; small?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <input autoFocus type="number" min={0} value={draft} placeholder="pulls"
        onChange={e => setDraft(e.target.value)}
        onBlur={onCommit}
        onKeyDown={e => { if (e.key==='Enter') onCommit(); if (e.key==='Escape') onCancel(); }}
        className={`text-center font-mono rounded-lg border outline-none ${small ? 'w-14 h-6 text-[11px]' : 'w-16 h-7 text-[12px]'}`}
        style={{ background: 'var(--surface2)', borderColor: 'rgba(76,123,214,0.5)', color: 'var(--text)' }} />
      <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>pulls</span>
    </div>
  );
}

function StatCard({ label, value, icon, highlight = false }: {
  label: string; value: string; icon?: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
      style={{ background: highlight ? 'rgba(76,123,214,0.06)' : 'var(--surface)', border: highlight ? '1px solid rgba(76,123,214,0.2)' : '1px solid var(--border)' }}>
      <span className="text-[9px] font-mono uppercase tracking-widest leading-none" style={{ color: 'var(--muted)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-base font-mono font-bold tabular-nums leading-none"
          style={{ color: highlight ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
      </div>
    </div>
  );
}
