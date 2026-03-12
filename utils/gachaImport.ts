import { HARDCODED } from '@/data/resonators';
import type { Resonator } from '@/types';

export interface GachaPull {
  name:         string;
  resourceType: string; // "Resonator" | "Weapon"
  qualityLevel: number; // 4 | 5
  time:         string;
  cardPoolType: string;
}

export interface GachaImportResult {
  /** resonator id → number of 5★ copies pulled (for seq calculation) */
  copies:    Record<number, number>;
  /** resonator id → total pulls spent on the banner they were gotten from */
  pulls:     Record<number, number>;
  /** current pity on limited banner (pulls since last 5★) */
  limitedPity:   number;
  /** current pity on standard banner */
  standardPity:  number;
  /** total pulls fetched across all banners */
  totalFetched:  number;
}

// cardPoolType values
const POOL_LIMITED  = '1';
const POOL_STANDARD = '3';

/** Flat list of all resonators across all version groups */
function getAllResonators(): Resonator[] {
  return HARDCODED.flatMap(g => g.entries);
}

/** Fetch all pages for one cardPoolType via our proxy */
async function fetchAllPages(baseUrl: string, cardPoolType: string): Promise<GachaPull[]> {
  const all: GachaPull[] = [];
  let page = 1;

  while (true) {
    const proxyUrl = `/api/gacha-proxy?${new URLSearchParams({
      url: baseUrl,
      cardPoolType,
      page: String(page),
    })}`;

    const res  = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy error ${res.status} on page ${page}`);

    const json = await res.json();

    // Kuro wraps results in data.list
    const list: GachaPull[] = json?.data?.list ?? [];
    if (list.length === 0) break;

    all.push(...list);

    // If fewer records than page size came back, we're on the last page
    if (list.length < 100) break;
    page++;
  }

  return all;
}

/**
 * Main entry point. Pass the raw gacha URL from the game log.
 * Returns structured data ready to apply to the tracker store.
 */
export async function importGachaHistory(gachaUrl: string): Promise<GachaImportResult> {
  const allResonators = getAllResonators();

  // Fetch limited and standard banners in parallel
  const [limitedPulls, standardPulls] = await Promise.all([
    fetchAllPages(gachaUrl, POOL_LIMITED),
    fetchAllPages(gachaUrl, POOL_STANDARD),
  ]);

  const copies: Record<number, number> = {};
  const pulls:  Record<number, number> = {};

  function processPulls(pullList: GachaPull[]) {
    // API returns newest-first; we reverse so we process chronologically
    const chronological = [...pullList].reverse();

    let pullsSinceLastFiveStar = 0;

    for (const pull of chronological) {
      pullsSinceLastFiveStar++;

      if (pull.resourceType !== 'Resonator' || pull.qualityLevel !== 5) continue;

      const resonator = allResonators.find(
        r => r.name.toLowerCase() === pull.name.toLowerCase()
      );
      if (!resonator) continue;

      copies[resonator.id] = (copies[resonator.id] ?? 0) + 1;

      // Attribute the pulls-since-last-5star to this character
      pulls[resonator.id] = (pulls[resonator.id] ?? 0) + pullsSinceLastFiveStar;
      pullsSinceLastFiveStar = 0;
    }

    return pullsSinceLastFiveStar; // remaining = current pity
  }

  const limitedPity  = processPulls(limitedPulls);
  const standardPity = processPulls(standardPulls);

  return {
    copies,
    pulls,
    limitedPity,
    standardPity,
    totalFetched: limitedPulls.length + standardPulls.length,
  };
}
