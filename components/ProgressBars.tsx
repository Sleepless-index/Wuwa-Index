import { useTrackerStore } from '@/store/trackerStore';

export default function ProgressBars() {
  const stateMap   = useTrackerStore(s => s.state);
  const versions   = useTrackerStore(s => s.versions);
  const allEntries = versions.flatMap(g => g.entries);
  const total      = allEntries.length;

  const got    = allEntries.filter(e => stateMap[e.id]?.res).length;
  const sig    = allEntries.filter(e => (stateMap[e.id]?.wep ?? 0) > 0).length;
  const resPct = total ? Math.round((got / total) * 100) : 0;
  const sigPct = total ? Math.round((sig / total) * 100) : 0;

  return (
    <div className="flex gap-3 mb-5">
      <Bar label="resonators" pct={resPct} color="bg-got"   textColor="text-got"  />
      <Bar label="sig weapons" pct={sigPct}  color="bg-sig"  textColor="text-sig"  />
    </div>
  );
}

function Bar({ label, pct, color, textColor }: {
  label: string; pct: number; color: string; textColor: string;
}) {
  return (
    <div className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-mono text-subtext uppercase tracking-wide">{label}</span>
        <span className={`text-xs font-mono font-semibold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
