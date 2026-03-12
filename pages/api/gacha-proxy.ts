import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy for Kuro's gacha history API.
 * Accepts a `url` query param (the full signed gacha URL from the game log),
 * plus an optional `cardPoolType` override and `recordId` / `serverId` / `playerId`
 * if you want to reconstruct the URL server-side.
 *
 * Usage: GET /api/gacha-proxy?url=<encoded gacha url>&cardPoolType=1&page=1
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, cardPoolType, page } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Parse the base URL and override/add our params
    const target = new URL(url);
    if (cardPoolType) target.searchParams.set('cardPoolType', String(cardPoolType));
    if (page)         target.searchParams.set('page',         String(page));
    // Always request max page size
    target.searchParams.set('size', '100');

    const response = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Kuro API returned ${response.status}` });
    }

    const data = await response.json();

    // Cache for a short time since the signed URL expires in ~1hr anyway
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (err) {
    console.error('gacha-proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch gacha data' });
  }
}
