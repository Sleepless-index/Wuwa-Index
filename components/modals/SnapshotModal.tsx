import { useState, useCallback } from 'react';
import Modal, { ModalFooter, ModalBtn } from './Modal';
import { useTrackerStore } from '@/store/trackerStore';
import { EL_COLORS } from '@/data/resonators';
import { generateSnapshot } from '@/utils/snapshot';
import { toImageSlug } from '@/utils/helpers';
import type { SnapView } from '@/types';

export default function SnapshotModal({ onClose }: { onClose: () => void }) {
  const versions   = useTrackerStore(s => s.versions);
  const stateMap   = useTrackerStore(s => s.state);
  const allEntries = versions.flatMap(g => g.entries);

  const [snapView,   setSnapView]   = useState<SnapView>('gallery');
  const [ownedOnly,  setOwnedOnly]  = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [exportMsg,  setExportMsg]  = useState('');

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const copied = await generateSnapshot({ snapView, ownedOnly, allEntries, versions, state: stateMap });
      setExportMsg(copied ? '✓ Copied + saved!' : '✓ Saved!');
    } catch {
      setExportMsg('✕ Export failed');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(''), 2500);
    }
  }, [snapView, ownedOnly, allEntries, versions, stateMap]);

  // Preview data
  const owned    = allEntries.filter(e => stateMap[e.id]?.res);
  const notOwned = allEntries.filter(e => !stateMap[e.id]?.res);

  return (
    <Modal onClose={onClose} wide>
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-surface2 rounded-t-2xl">
        {/* View toggle */}
        <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
          {(['list', 'gallery'] as const).map(v => (
            <button
              key={v}
              onClick={() => setSnapView(v === 'list' ? 'regions' : 'gallery')}
              className={`
                text-[11px] font-mono px-3 py-1.5 transition-all
                ${(v === 'list' ? snapView === 'regions' : snapView === 'gallery')
                  ? 'bg-accent/15 text-accent'
                  : 'text-subtext hover:text-text'}
              `}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Owned only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ownedOnly}
            onChange={e => setOwnedOnly(e.target.checked)}
            className="cb"
          />
          <span className="text-xs font-mono text-subtext">owned only</span>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          {exportMsg && (
            <span className={`text-xs font-mono ${exportMsg.startsWith('✓') ? 'text-got' : 'text-havoc'}`}>
              {exportMsg}
            </span>
          )}
          <ModalBtn primary onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating…' : '⎘ Copy + Save'}
          </ModalBtn>
          <ModalBtn onClick={onClose}>Close</ModalBtn>
        </div>
      </div>

      {/* Preview */}
      <div className="overflow-y-auto p-4">
        {snapView === 'gallery' ? (
          <GalleryPreview owned={owned} notOwned={notOwned} ownedOnly={ownedOnly} stateMap={stateMap} />
        ) : (
          <RegionsPreview versions={versions} ownedOnly={ownedOnly} stateMap={stateMap} />
        )}
      </div>
    </Modal>
  );
}

// ─── Gallery preview ──────────────────────────────────────────────────────────

function GalleryPreview({ owned, notOwned, ownedOnly, stateMap }: any) {
  return (
    <div>
      <CardGroup label={`owned · ${owned.length}`} entries={owned} stateMap={stateMap} />
      {!ownedOnly && notOwned.length > 0 && (
        <CardGroup label={`not owned · ${notOwned.length}`} entries={notOwned} stateMap={stateMap} />
      )}
    </div>
  );
}

function CardGroup({ label, entries, stateMap }: any) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-mono text-subtext uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {entries.map((e: any) => <SnapCard key={e.id} entry={e} s={stateMap[e.id]} />)}
      </div>
    </div>
  );
}

function SnapCard({ entry, s }: any) {
  const slug = toImageSlug(entry.name);
  const obtained = s?.res;
  return (
    <div className={`relative w-[70px] rounded-lg overflow-hidden border transition-all ${obtained ? 'border-sig/30' : 'border-border opacity-50'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`art/art_${slug}.avif`}
        alt={entry.name}
        className="w-full h-[100px] object-cover"
        onError={e => { (e.currentTarget as HTMLImageElement).src = `icons/head_${slug}.webp`; }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-4 pb-1 px-1">
        {obtained && (
          <div className="flex gap-0.5 mb-0.5">
            <span className={`text-[8px] font-mono font-bold px-1 rounded ${s.seq===6?'text-wish':'text-electro'}`}>S{s.seq||0}</span>
            <span className={`text-[8px] font-mono px-1 rounded ${s.wep===5?'text-wish':'text-sig'}`}>R{s.wep||0}</span>
          </div>
        )}
        <p className="text-[8px] font-medium text-white/90 leading-tight truncate">{entry.name}</p>
      </div>
    </div>
  );
}

// ─── Regions / list preview ───────────────────────────────────────────────────

function RegionsPreview({ versions, ownedOnly, stateMap }: any) {
  const visCols = versions.filter(({ entries }: any) =>
    !ownedOnly || entries.some((e: any) => stateMap[e.id]?.res)
  );
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {visCols.map(({ label, entries }: any) => {
        const filtered = ownedOnly ? entries.filter((e: any) => stateMap[e.id]?.res) : entries;
        const got = entries.filter((e: any) => stateMap[e.id]?.res).length;
        return (
          <div key={label} className="flex-shrink-0 min-w-[140px]">
            <div className="text-[10px] font-mono text-subtext uppercase tracking-wide mb-2">
              {label} <span className="text-muted">{got}/{entries.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              {filtered.map((e: any) => {
                const s = stateMap[e.id];
                const slug = toImageSlug(e.name);
                return (
                  <div key={e.id} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${s?.res ? 'bg-sig/5 border border-sig/15' : 'text-subtext'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`icons/head_${slug}.webp`} alt="" className={`w-5 h-5 rounded-full object-cover flex-shrink-0 ${s?.res ? '' : 'opacity-30'}`} onError={e => (e.currentTarget.style.display='none')} />
                    <span className={`flex-1 truncate font-medium ${s?.res ? 'text-text' : ''}`}>{e.name}</span>
                    {s?.res && (
                      <span className="text-[9px] font-mono text-subtext flex-shrink-0">
                        <span className={s.seq===6?'text-wish':'text-electro'}>S{s.seq||0}</span>
                        <span className={s.wep===5?'text-wish':'text-sig'}>R{s.wep||0}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
