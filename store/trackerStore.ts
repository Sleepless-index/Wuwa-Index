import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HARDCODED } from '@/data/resonators';
import type { ResonatorState, UpcomingEntry, VersionGroup, Resonator } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrackerStore {
  // Persisted state
  state: Record<number, ResonatorState>;
  priority: number[];
  upcoming: UpcomingEntry[];
  releasedUpcoming: UpcomingEntry[];
  versions: VersionGroup[];
  uidCounter: number;

  // UI state (not persisted)
  activeFilter: string;
  weaponState: Record<string, number>; // slug → rank 0-5 for standard weapons
  pullCounts: Record<string, number>;  // id or "wep-{file}" → pulls spent

  // Derived helpers (computed on access)
  allEntries: () => Resonator[];

  // Resonator actions
  setRes:  (id: number, val: boolean) => void;
  setSeq:  (id: number, val: number) => void;
  setWep:  (id: number, val: number) => void;

  // Standard weapon action
  setStdWeaponRank: (slug: string, rank: number) => void;

  // Pull count action
  setPulls: (id: string | number, pulls: number) => void;

  // Priority actions
  togglePriority:    (id: number) => void;
  removeFromPriority:(id: number) => void;
  reorderPriority:   (fromId: number, toId: number) => void;

  // Upcoming actions
  addUpcoming:     (name: string, element: string) => void;
  deleteUpcoming:  (uid: number) => void;
  editUpcoming:    (uid: number, name: string, element: string) => void;
  releaseUpcoming: (uid: number, name: string, element: string) => void;

  // Filter
  setFilter: (el: string) => void;

  // Import / Reset
  importData:        (raw: string) => string; // returns error message or ''
  applyGachaImport:  (counts: Record<string, number>) => void; // merge pull counts from gacha history
  resetAll:          () => void;
}

// ─── Default resonator state ─────────────────────────────────────────────────

const defaultResState = (): ResonatorState => ({ res: false, seq: 0, wep: 0 });

// ─── Build versions from HARDCODED + released upcoming ───────────────────────

function buildVersions(released: UpcomingEntry[]): VersionGroup[] {
  const base = JSON.parse(JSON.stringify(HARDCODED)) as VersionGroup[];
  const last  = base[base.length - 1];
  released.forEach(u => {
    if (!last.entries.find(e => e.id === u.uid)) {
      last.entries.push({ id: u.uid, ver: '?', name: u.name, element: u.element as any });
    }
  });
  return base;
}

// ─── Initialise per-entry state for any missing entries ──────────────────────

function ensureState(
  currentState: Record<number, ResonatorState>,
  versions: VersionGroup[],
): Record<number, ResonatorState> {
  const next = { ...currentState };
  versions.flatMap(g => g.entries).forEach(e => {
    if (!next[e.id]) next[e.id] = defaultResState();
    if (next[e.id].seq === undefined) next[e.id].seq = 0;
    if (next[e.id].wep === undefined) next[e.id].wep = 0;
  });
  return next;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ──
      state:            {},
      priority:         [],
      upcoming:         [],
      releasedUpcoming: [],
      versions:         buildVersions([]),
      uidCounter:       200,
      activeFilter:     'All',
      weaponState:      {},
      pullCounts:       {},

      // ── Derived ──
      allEntries: () => get().versions.flatMap(g => g.entries),

      // ── Resonator ──
      setRes: (id, val) =>
        set(s => {
          const next = { ...s.state, [id]: { ...s.state[id], res: val } };
          // Clear seq/wep if unchecking; remove from priority if checking
          if (!val) {
            next[id] = { ...next[id], seq: 0, wep: 0 };
          }
          const priority = val
            ? s.priority.filter(x => x !== id)
            : s.priority;
          return { state: next, priority };
        }),

      setSeq: (id, val) =>
        set(s => ({
          state: {
            ...s.state,
            [id]: { ...s.state[id], seq: s.state[id]?.seq === val ? 0 : val },
          },
        })),

      setWep: (id, val) =>
        set(s => ({
          state: {
            ...s.state,
            [id]: { ...s.state[id], wep: s.state[id]?.wep === val ? 0 : val },
          },
        })),

      // ── Priority ──
      togglePriority: (id) =>
        set(s => {
          if (s.state[id]?.res) return s; // can't prioritise owned
          const has = s.priority.includes(id);
          return {
            priority: has
              ? s.priority.filter(x => x !== id)
              : [...s.priority, id],
          };
        }),

      removeFromPriority: (id) =>
        set(s => ({ priority: s.priority.filter(x => x !== id) })),

      reorderPriority: (fromId, toId) =>
        set(s => {
          const list = [...s.priority];
          const fi   = list.indexOf(fromId);
          const ti   = list.indexOf(toId);
          if (fi === -1 || ti === -1) return s;
          list.splice(fi, 1);
          list.splice(ti, 0, fromId);
          return { priority: list };
        }),

      // ── Upcoming ──
      addUpcoming: (name, element) =>
        set(s => {
          const uid = s.uidCounter;
          return {
            upcoming:   [...s.upcoming, { uid, name, element }],
            uidCounter: uid + 1,
          };
        }),

      deleteUpcoming: (uid) =>
        set(s => ({
          upcoming: s.upcoming.filter(u => u.uid !== uid),
          priority: s.priority.filter(x => x !== uid),
        })),

      editUpcoming: (uid, name, element) =>
        set(s => ({
          upcoming: s.upcoming.map(u => u.uid === uid ? { ...u, name, element } : u),
        })),

      releaseUpcoming: (uid, name, element) =>
        set(s => {
          const newEntry = { id: uid, ver: '?', name, element: element as any };
          const versions = s.versions.map((g, i) => {
            if (i !== s.versions.length - 1) return g;
            if (g.entries.find(e => e.id === uid)) return g;
            return { ...g, entries: [...g.entries, newEntry] };
          });
          const resState = ensureState({ ...s.state, [uid]: defaultResState() }, versions);
          return {
            versions,
            state:            resState,
            upcoming:         s.upcoming.filter(u => u.uid !== uid),
            releasedUpcoming: [...s.releasedUpcoming, { uid, name, element }],
          };
        }),

      // ── Filter ──
      setFilter: (el) => set({ activeFilter: el }),

      // ── Standard weapon rank ──
      setStdWeaponRank: (slug, rank) =>
        set(s => ({
          weaponState: { ...s.weaponState, [slug]: s.weaponState[slug] === rank ? 0 : rank },
        })),

      // ── Pull counts ──
      setPulls: (id, pulls) =>
        set(s => ({
          pullCounts: { ...s.pullCounts, [String(id)]: pulls < 0 ? 0 : pulls },
        })),

      // ── Import ──
      importData: (raw) => {
        try {
          const p        = JSON.parse(raw);
          const pState   = p.state || p;
          const pWish    = Array.isArray(p.priority)         ? p.priority         : [];
          const pUp      = Array.isArray(p.upcoming)         ? p.upcoming         : [];
          const pRel     = Array.isArray(p.releasedUpcoming) ? p.releasedUpcoming : [];
          if (typeof pState !== 'object' || Array.isArray(pState)) throw new Error('invalid');

          const versions   = buildVersions(pRel);
          const allEntries = versions.flatMap(g => g.entries);

          const state: Record<number, ResonatorState> = {};
          allEntries.forEach(e => {
            const d = pState[e.id] || pState[String(e.id)];
            state[e.id] = {
              res: !!d?.res,
              seq: typeof d?.seq === 'number' ? d.seq : 0,
              wep: typeof d?.wep === 'number' ? d.wep : 0,
            };
          });

          const priority = (pWish as number[]).filter(id =>
            allEntries.some(e => e.id === id) || pUp.find((u: UpcomingEntry) => u.uid === id)
          );
          const uidCounter = Math.max(200, ...[...pUp, ...pRel].map((u: any) => u.uid ?? 0)) + 1;

          set({ state, priority, upcoming: pUp, releasedUpcoming: pRel, versions, uidCounter });
          return '';
        } catch {
          return 'Invalid data — please paste a valid export.';
        }
      },

      // ── Gacha import ──
      applyGachaImport: (counts) =>
        set(s => ({
          pullCounts: { ...s.pullCounts, ...counts },
        })),

      // ── Reset ──
      resetAll: () => {
        const versions = buildVersions([]);
        set({
          state:            ensureState({}, versions),
          priority:         [],
          upcoming:         [],
          releasedUpcoming: [],
          versions,
          uidCounter:       200,
          activeFilter:     'All',
        });
      },
    }),

    {
      name:    'wuwa-tracker',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({ getItem: () => null, setItem: () => {}, removeItem: () => {} } as any)
      ),
      // Only persist these keys
      partialize: (s) => ({
        state:            s.state,
        priority:         s.priority,
        upcoming:         s.upcoming,
        releasedUpcoming: s.releasedUpcoming,
        uidCounter:       s.uidCounter,
        weaponState:      s.weaponState,
        pullCounts:       s.pullCounts,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (s) => {
        if (!s) return;
        // Rebuild versions from persisted releasedUpcoming
        const versions   = buildVersions(s.releasedUpcoming ?? []);
        const resState   = ensureState(s.state ?? {}, versions);
        const allEntries = versions.flatMap(g => g.entries);
        const priority   = (s.priority ?? []).filter((id: number) => {
          const upItem = (s.upcoming ?? []).find((u: UpcomingEntry) => u.uid === id);
          return (allEntries.some(e => e.id === id) || upItem) && !resState[id]?.res;
        });
        s.versions  = versions;
        s.state     = resState;
        s.priority  = priority;
      },
    }
  )
);
