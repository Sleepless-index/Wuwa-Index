import { useTrackerStore } from '@/store/trackerStore';

const CARDS = [
  { key: 'got',  label: 'obtained',    color: 'text-got'     },
  { key: 'sig',  label: 'sig weapons', color: 'text-sig'     },
  { key: 'skip', label: 'not pulled',  color: 'text-subtext' },
] as const;

export default function StatsBar() {
  const stateMap   = useTrackerStore(s => s.state);
  const versions   = useTrackerStore(s => s.versions);
  const allEntries = versions.flatMap(g => g.entries);

  const got   = allEntries.filter(e => stateMap[e.id]?.res).length;
  const sig   = allEntries.filter(e => (stateMap[e.id]?.wep ?? 0) > 0).length;
  const total = allEntries.length;

  const values = { got, sig, skip: total - got };

  return (
    <div className="grid grid-cols-3 bg-surface border border-border rounded-xl overflow-hidden">
      {CARDS.map(({ key, label, color }, i) => (
        <div
          key={key}
          className={`px-3 py-2.5 flex flex-col gap-0.5 ${i < 2 ? 'border-r border-border' : ''}`}
        >
          <span className="text-[10px] font-mono text-subtext uppercase tracking-wide">{label}</span>
          <span className={`text-xl font-semibold font-mono ${color}`}>{values[key]}</span>
        </div>
      ))}
    </div>
  );
}
