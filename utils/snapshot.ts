import type { Resonator, ResonatorState, VersionGroup } from '@/types';
import { toImageSlug } from './helpers';

interface SnapshotOptions {
  snapView:   'gallery' | 'regions';
  ownedOnly:  boolean;
  allEntries: Resonator[];
  versions:   VersionGroup[];
  state:      Record<number, ResonatorState>;
}

const DPR      = 2;
const PAD      = 24;
const HEADER_H = 48;

// ─── Image loader with cache ──────────────────────────────────────────────────

const imgCache: Record<string, Promise<HTMLImageElement | null>> = {};
function loadImg(src: string): Promise<HTMLImageElement | null> {
  if (!imgCache[src]) {
    imgCache[src] = new Promise(res => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    });
  }
  return imgCache[src];
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width  = w * DPR;
  c.height = h * DPR;
  const ctx = c.getContext('2d')!;
  ctx.scale(DPR, DPR);
  return { canvas: c, ctx };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  totalW: number,
  got: number,
  total: number,
  sig: number,
) {
  // Right stat (resonators) — flush with right edge of grid
  // Left stat (sig weapons) — flush with left edge of grid
  ctx.textAlign  = 'left';
  ctx.font       = '600 14px "JetBrains Mono",monospace';
  ctx.fillStyle  = '#7eb8f7';
  ctx.fillText(`${sig}/${total}`, PAD, PAD + 16);
  ctx.font       = '500 9px "JetBrains Mono",monospace';
  ctx.fillStyle  = '#45495a';
  ctx.fillText('SIG WEAPONS', PAD, PAD + 29);
  // Right stat (resonators) — flush with right edge of grid
  ctx.textAlign  = 'right';
  ctx.font       = '600 14px "JetBrains Mono",monospace';
  ctx.fillStyle  = '#89d9a0';
  ctx.fillText(`${got}/${total}`, totalW - PAD, PAD + 16);
  ctx.font       = '500 9px "JetBrains Mono",monospace';
  ctx.fillStyle  = '#45495a';
  ctx.fillText('RESONATORS', totalW - PAD, PAD + 29);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + HEADER_H - 6);
  ctx.lineTo(totalW - PAD, PAD + HEADER_H - 6);
  ctx.stroke();
}

// ─── Export canvas → clipboard + download ────────────────────────────────────

function exportCanvas(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise(resolve => {
    canvas.toBlob(async blob => {
      if (!blob) { resolve(false); return; }
      let copied = false;
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        copied = true;
      } catch { /* clipboard not granted */ }
      const a = document.createElement('a');
      a.download = 'wuwa-snapshot.png';
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(copied);
    }, 'image/png');
  });
}

// ─── Gallery mode ─────────────────────────────────────────────────────────────

async function gallerySnapshot(opts: SnapshotOptions): Promise<boolean> {
  const { ownedOnly, allEntries, state } = opts;
  const CARD_W = 110, CARD_H = 160, CARD_GAP = 6, CARD_R = 10;
  const COLS = 6, LABEL_H = 22, SEC_GAP = 20;

  const headMap: Record<number, HTMLImageElement | null> = {};
  await Promise.all(allEntries.map(async e => {
    headMap[e.id] = await loadImg(`icons/head_${toImageSlug(e.name)}.webp`);
  }));

  const imgMap: Record<number, HTMLImageElement | null> = {};
  await Promise.all(allEntries.map(async e => {
    const art = await loadImg(`art/art_${toImageSlug(e.name)}.avif`);
    imgMap[e.id] = art || headMap[e.id];
  }));

  const owned    = allEntries.filter(e =>  state[e.id]?.res);
  const sections: { label: string; entries: Resonator[] }[] = [];
  if (owned.length)                sections.push({ label: `owned · ${owned.length}`,        entries: owned });

  const total = allEntries.length;
  const got   = owned.length;
  const sig   = allEntries.filter(e => (state[e.id]?.wep ?? 0) > 0).length;

  const totalW = PAD * 2 + COLS * CARD_W + (COLS - 1) * CARD_GAP;
  let totalH   = PAD + HEADER_H;
  sections.forEach(s => {
    totalH += SEC_GAP + Math.ceil(s.entries.length / COLS) * (CARD_H + CARD_GAP) - CARD_GAP;
  });
  totalH += PAD;

  const { canvas, ctx } = makeCanvas(totalW, totalH);
  ctx.fillStyle = '#13141a';
  ctx.fillRect(0, 0, totalW, totalH);
  drawHeader(ctx, totalW, got, total, sig);

  let yOff = PAD + HEADER_H;
  for (const sec of sections) {
    yOff += SEC_GAP;

    for (let i = 0; i < sec.entries.length; i++) {
      const e  = sec.entries[i];
      const s  = state[e.id] ?? { res: false, seq: 0, wep: 0, sig: false };
      const cx = PAD + (i % COLS) * (CARD_W + CARD_GAP);
      const cy = yOff + Math.floor(i / COLS) * (CARD_H + CARD_GAP);

      ctx.save();
      rr(ctx, cx, cy, CARD_W, CARD_H, CARD_R);
      ctx.clip();
      ctx.fillStyle = '#1c1f27';
      ctx.fillRect(cx, cy, CARD_W, CARD_H);
      const img = imgMap[e.id];
      if (img) {
        ctx.globalAlpha = s.res ? 1 : 0.3;
        ctx.drawImage(img, cx, cy, CARD_W, CARD_H);
        ctx.globalAlpha = 1;
      }
      const grad = ctx.createLinearGradient(cx, cy + CARD_H * 0.35, cx, cy + CARD_H);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(8,10,14,0.93)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx, cy, CARD_W, CARD_H);
      ctx.restore();

      rr(ctx, cx + 0.75, cy + 0.75, CARD_W - 1.5, CARD_H - 1.5, CARD_R);
      ctx.strokeStyle = s.res ? 'rgba(245,216,138,0.45)' : 'rgba(54,60,71,0.8)';
      ctx.lineWidth = s.res ? 1.5 : 1;
      ctx.stroke();

      ctx.font      = '600 10px "DM Sans",sans-serif';
      ctx.fillStyle = s.res ? '#f5f0e8' : '#45495a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // Reserve space for S#R# badge if owned
      const BADGE_W = s.res ? 28 : 0;
      const nameMaxW = CARD_W - 10 - BADGE_W;
      let name = e.name;
      while (ctx.measureText(name).width > nameMaxW && name.length > 1) name = name.slice(0, -1);
      if (name !== e.name) name += '…';
      ctx.fillText(name, cx + 5, cy + CARD_H - 7);

      if (s.res) {
        const isMaxS = s.seq === 6, isMaxR = s.wep === 5;
        const sText = `S${s.seq || 0}`, rText = `R${s.wep || 0}`;
        const BFONT = '800 8px "JetBrains Mono",monospace';
        const RFONT = '500 8px "JetBrains Mono",monospace';
        ctx.font = BFONT;
        const sW = ctx.measureText(sText).width + 4;
        ctx.font = RFONT;
        const rW = ctx.measureText(rText).width + 4;
        const bW = sW + rW + 2, bH = 13;
        const bX = cx + CARD_W - bW - 4;
        const bY = cy + CARD_H - bH - 4;
        rr(ctx, bX, bY, bW, bH, 3);
        ctx.fillStyle = 'rgba(13,13,25,0.88)'; ctx.fill();
        ctx.strokeStyle = (isMaxS && isMaxR) ? 'rgba(245,216,138,0.7)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.75; rr(ctx, bX, bY, bW, bH, 3); ctx.stroke();
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f5d88a'; ctx.font = BFONT;
        ctx.fillText(sText, bX + 2, bY + bH / 2);
        ctx.fillStyle = '#f5d88a'; ctx.font = RFONT;
        ctx.fillText(rText, bX + sW + 2, bY + bH / 2);
        ctx.textBaseline = 'alphabetic';
      }
    }
    const rows = Math.ceil(sec.entries.length / COLS);
    yOff += rows * (CARD_H + CARD_GAP) - CARD_GAP;
  }

  return exportCanvas(canvas);
}

// ─── Regions mode ─────────────────────────────────────────────────────────────

async function regionsSnapshot(opts: SnapshotOptions): Promise<boolean> {
  const { ownedOnly, allEntries, versions, state } = opts;
  const ROW_H = 28, ROW_GAP = 3, ICON_S = 22, ICON_R = 4;
  const COL_W = 160, COL_GAP = 1, DIVIDER_W = 1, LABEL_H = 20, SEC_GAP = 16;

  const headMap: Record<number, HTMLImageElement | null> = {};
  await Promise.all(allEntries.map(async e => {
    headMap[e.id] = await loadImg(`icons/head_${toImageSlug(e.name)}.webp`);
  }));

  const visCols = versions.map(({ label, entries }) => {
    const filtered = ownedOnly ? entries.filter(e => state[e.id]?.res) : entries;
    const verGot   = entries.filter(e => state[e.id]?.res).length;
    return { label, count: `${verGot}/${entries.length}`, entries: filtered };
  }).filter(c => c.entries.length > 0);

  const total = allEntries.length;
  const got   = allEntries.filter(e => state[e.id]?.res).length;
  const sig   = allEntries.filter(e => (state[e.id]?.wep ?? 0) > 0).length;

  const totalW  = PAD * 2 + visCols.length * COL_W + (visCols.length - 1) * (COL_GAP + DIVIDER_W);
  const maxRows = Math.max(...visCols.map(c => c.entries.length));
  const colH    = LABEL_H + maxRows * (ROW_H + ROW_GAP) - ROW_GAP;
  const totalH  = PAD + HEADER_H + SEC_GAP + colH + PAD;

  const { canvas, ctx } = makeCanvas(totalW, totalH);
  ctx.fillStyle = '#13141a';
  ctx.fillRect(0, 0, totalW, totalH);
  drawHeader(ctx, totalW, got, total, sig);

  let xOff = PAD;
  const yBase = PAD + HEADER_H + SEC_GAP;

  for (let ci = 0; ci < visCols.length; ci++) {
    const col = visCols[ci];
    if (ci > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(xOff - COL_GAP - DIVIDER_W, yBase, DIVIDER_W, colH);
    }
    ctx.textAlign  = 'left';
    ctx.font       = '700 9px "JetBrains Mono",monospace';
    ctx.fillStyle  = '#45495a';
    ctx.fillText(col.label.toUpperCase(), xOff, yBase + 12);
    ctx.font       = '500 9px "JetBrains Mono",monospace';
    ctx.fillStyle  = '#45495a';
    ctx.fillText(col.count, xOff + ctx.measureText(col.label.toUpperCase()).width + 5, yBase + 12);

    let yRow = yBase + LABEL_H;
    for (const e of col.entries) {
      const s = state[e.id] ?? { res: false, seq: 0, wep: 0, sig: false };
      if (s.res) {
        rr(ctx, xOff, yRow, COL_W, ROW_H, 5);
        ctx.fillStyle   = 'rgba(126,184,247,0.05)'; ctx.fill();
        ctx.strokeStyle = 'rgba(126,184,247,0.2)'; ctx.lineWidth = 0.75;
        rr(ctx, xOff + 0.5, yRow + 0.5, COL_W - 1, ROW_H - 1, 5); ctx.stroke();
      }
      const icon = headMap[e.id];
      if (icon) {
        ctx.save();
        rr(ctx, xOff + 5, yRow + (ROW_H - ICON_S) / 2, ICON_S, ICON_S, ICON_R);
        ctx.clip();
        ctx.globalAlpha = s.res ? 1 : 0.35;
        ctx.drawImage(icon, xOff + 5, yRow + (ROW_H - ICON_S) / 2, ICON_S, ICON_S);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      ctx.font       = '500 10px "DM Sans",sans-serif';
      ctx.fillStyle  = s.res ? '#f5f0e8' : '#45495a';
      ctx.textAlign  = 'left'; ctx.textBaseline = 'middle';
      let name = e.name;
      const maxW = COL_W - ICON_S - 14 - (s.res ? 40 : 0);
      while (ctx.measureText(name).width > maxW && name.length > 1) name = name.slice(0, -1);
      if (name !== e.name) name += '…';
      ctx.fillText(name, xOff + ICON_S + 9, yRow + ROW_H / 2);

      if (s.res) {
        const seqTxt = `S${s.seq || 0}`, wepTxt = `R${s.wep || 0}`;
        ctx.font = '700 8px "JetBrains Mono",monospace';
        const tagW = ctx.measureText(seqTxt + wepTxt).width + 12;
        const tagH = 14, tagX = xOff + COL_W - tagW - 4, tagY = yRow + (ROW_H - tagH) / 2;
        rr(ctx, tagX, tagY, tagW, tagH, 3);
        ctx.fillStyle = 'rgba(13,13,25,0.85)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.75;
        rr(ctx, tagX, tagY, tagW, tagH, 3); ctx.stroke();
        ctx.textBaseline = 'middle';
        const sW = ctx.measureText(seqTxt).width;
        ctx.fillStyle = '#f5d88a';
        ctx.textAlign = 'left';
        ctx.fillText(seqTxt, tagX + 5, tagY + tagH / 2);
        ctx.fillStyle = '#f5d88a';
        ctx.fillText(wepTxt, tagX + 5 + sW + 2, tagY + tagH / 2);
      }
      ctx.textBaseline = 'alphabetic';
      yRow += ROW_H + ROW_GAP;
    }
    xOff += COL_W + COL_GAP + DIVIDER_W;
  }

  return exportCanvas(canvas);
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function generateSnapshot(opts: SnapshotOptions): Promise<boolean> {
  return opts.snapView === 'gallery'
    ? gallerySnapshot(opts)
    : regionsSnapshot(opts);
}

// ─── Weapon snapshot ──────────────────────────────────────────────────────────

export interface WeaponSnapshotOptions {
  sigWeapons:   import('@/data/weapons').Weapon[];
  stdWeapons:   import('@/data/weapons').Weapon[];
  state:        Record<number, import('@/types').ResonatorState>;
  weaponState:  Record<string, number>;
  versions:     import('@/types').VersionGroup[];
  snapView:     'gallery' | 'list';
  showNotOwned?: boolean;
}

async function weaponGallerySnapshot(opts: WeaponSnapshotOptions): Promise<boolean> {
  const { sigWeapons, stdWeapons, state, weaponState, versions } = opts;
  const CARD_W = 110, CARD_H = 160, CARD_GAP = 6, CARD_R = 10;
  const COLS = 6, LABEL_H = 22, SEC_GAP = 20;

  const allEntries = versions.flatMap(g => g.entries);

  // Helper: get rank for a weapon
  const getRank = (w: import('@/data/weapons').Weapon): number => {
    if (w.owner) {
      const ownerEntry = allEntries.find(e =>
        toImageSlug(e.name) === toImageSlug(w.owner!)
      );
      return ownerEntry ? (state[ownerEntry.id]?.wep ?? 0) : 0;
    }
    return weaponState[w.file] ?? 0;
  };

  const allWeapons = [...sigWeapons, ...stdWeapons];
  const owned      = allWeapons.filter(w => getRank(w) > 0);

  // Preload weapon images
  const imgMap: Record<string, HTMLImageElement | null> = {};
  await Promise.all(allWeapons.map(async w => {
    imgMap[w.file] = await loadImg(`weapons/${w.file}.avif`);
  }));

  const sections = [
    { label: `owned · ${owned.length}`, entries: owned },
  ];

  const totalW = PAD * 2 + COLS * CARD_W + (COLS - 1) * CARD_GAP;
  let totalH   = PAD + HEADER_H;
  sections.forEach(s => {
    totalH += SEC_GAP + Math.ceil(s.entries.length / COLS) * (CARD_H + CARD_GAP) - CARD_GAP;
  });
  totalH += PAD;

  const { canvas, ctx } = makeCanvas(totalW, totalH);
  ctx.fillStyle = '#13141a';
  ctx.fillRect(0, 0, totalW, totalH);

  // Header
  const totalOwned = owned.length;
  const total      = allWeapons.length;
  ctx.textAlign = 'left';
  ctx.font = '600 14px "JetBrains Mono",monospace';
  ctx.fillStyle = '#f5d88a';
  ctx.fillText(`${totalOwned}/${total}`, PAD, PAD + 16);
  ctx.font = '500 9px "JetBrains Mono",monospace';
  ctx.fillStyle = '#45495a';
  ctx.fillText('WEAPONS OWNED', PAD, PAD + 29);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + HEADER_H - 6);
  ctx.lineTo(totalW - PAD, PAD + HEADER_H - 6);
  ctx.stroke();

  let yOff = PAD + HEADER_H;
  for (const sec of sections) {
    yOff += SEC_GAP;
    for (let i = 0; i < sec.entries.length; i++) {
      const w    = sec.entries[i];
      const rank = getRank(w);
      const isOwned = rank > 0;
      const isMax   = rank === 5;
      const cx = PAD + (i % COLS) * (CARD_W + CARD_GAP);
      const cy = yOff + Math.floor(i / COLS) * (CARD_H + CARD_GAP);

      ctx.save();
      rr(ctx, cx, cy, CARD_W, CARD_H, CARD_R);
      ctx.clip();
      ctx.fillStyle = '#1c1f27';
      ctx.fillRect(cx, cy, CARD_W, CARD_H);
      const img = imgMap[w.file];
      if (img) {
        ctx.globalAlpha = isOwned ? 1 : 0.22;
        // contain-fit: scale to fit within card preserving aspect ratio
        const iw = img.naturalWidth  > 0 ? img.naturalWidth  : img.width;
        const ih = img.naturalHeight > 0 ? img.naturalHeight : img.height;
        const scale = iw > 0 && ih > 0 ? Math.min(CARD_W / iw, CARD_H / ih) : 1;
        const dw = iw * scale, dh = ih * scale;
        const dx = cx + (CARD_W - dw) / 2, dy = cy + (CARD_H - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }
      const grad = ctx.createLinearGradient(cx, cy + CARD_H * 0.35, cx, cy + CARD_H);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(8,10,14,0.93)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx, cy, CARD_W, CARD_H);
      ctx.restore();

      // Border
      rr(ctx, cx + 0.75, cy + 0.75, CARD_W - 1.5, CARD_H - 1.5, CARD_R);
      ctx.strokeStyle = isOwned ? 'rgba(245,216,138,0.45)' : 'rgba(54,60,71,0.8)';
      ctx.lineWidth = isOwned ? 1.5 : 1;
      ctx.stroke();

      // Owner label
      if (w.owner) {
        ctx.font = '500 8px "JetBrains Mono",monospace';
        ctx.fillStyle = 'rgba(245,216,138,0.5)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        let ownerTxt = w.owner.replace(/_/g, ' ');
        while (ctx.measureText(ownerTxt).width > CARD_W - 10 && ownerTxt.length > 1)
          ownerTxt = ownerTxt.slice(0, -1);
        if (ownerTxt !== w.owner.replace(/_/g, ' ')) ownerTxt += '…';
        ctx.fillText(ownerTxt, cx + 5, cy + CARD_H - 18);
      }

      // Name
      ctx.font = '600 10px "DM Sans",sans-serif';
      ctx.fillStyle = isOwned ? '#f5f0e8' : '#45495a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      const BADGE_W = isOwned ? 22 : 0;
      const nameMaxW = CARD_W - 10 - BADGE_W;
      let name = w.name;
      while (ctx.measureText(name).width > nameMaxW && name.length > 1) name = name.slice(0, -1);
      if (name !== w.name) name += '…';
      ctx.fillText(name, cx + 5, cy + CARD_H - 7);

      // Rank badge
      if (isOwned) {
        const rText = `R${rank}`;
        const RFONT = '700 8px "JetBrains Mono",monospace';
        ctx.font = RFONT;
        const rW = ctx.measureText(rText).width + 6;
        const bH = 13;
        const bX = cx + CARD_W - rW - 4;
        const bY = cy + CARD_H - bH - 4;
        rr(ctx, bX, bY, rW, bH, 3);
        ctx.fillStyle = 'rgba(13,13,25,0.88)'; ctx.fill();
        ctx.strokeStyle = isMax ? 'rgba(245,216,138,0.7)' : 'rgba(245,216,138,0.3)';
        ctx.lineWidth = 0.75;
        rr(ctx, bX, bY, rW, bH, 3); ctx.stroke();
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f5d88a'; ctx.font = RFONT;
        ctx.fillText(rText, bX + 3, bY + bH / 2);
        ctx.textBaseline = 'alphabetic';
      }
    }
    const rows = Math.ceil(sec.entries.length / COLS);
    yOff += rows * (CARD_H + CARD_GAP) - CARD_GAP;
  }

  return exportCanvas(canvas);
}


async function weaponListSnapshot(opts: WeaponSnapshotOptions): Promise<boolean> {
  const { sigWeapons, stdWeapons, state, weaponState, versions, showNotOwned } = opts;
  const ROW_H = 28, ROW_GAP = 3, THUMB_S = 20, THUMB_R = 4;
  const COL_W = 160, COL_GAP = 1, DIVIDER_W = 1, LABEL_H = 22, SEC_GAP = 16;

  const allEntries = versions.flatMap(g => g.entries);
  const getRank = (w: import('@/data/weapons').Weapon): number => {
    if (w.owner) {
      const e = allEntries.find(e => toImageSlug(e.name) === toImageSlug(w.owner!));
      return e ? (state[e.id]?.wep ?? 0) : 0;
    }
    return weaponState[w.file] ?? 0;
  };

  const allWeapons = [...sigWeapons, ...stdWeapons];
  const CATEGORIES = ['Broadblade', 'Sword', 'Pistol', 'Gauntlet', 'Rectifier'] as const;

  // Preload weapon images
  const imgMap: Record<string, HTMLImageElement | null> = {};
  await Promise.all(allWeapons.map(async w => {
    imgMap[w.file] = await loadImg(`weapons/${w.file}.avif`);
  }));

  const cols = CATEGORIES.map(cat => {
    const catWeapons = allWeapons.filter(w => w.category === cat);
    const ownedInCat   = catWeapons.filter(w => getRank(w) > 0);
    const notOwnedInCat = showNotOwned ? catWeapons.filter(w => getRank(w) === 0) : [];
    return { label: cat, owned: ownedInCat, notOwned: notOwnedInCat };
  }).filter(c => c.owned.length > 0 || c.notOwned.length > 0);

  const totalOwned = allWeapons.filter(w => getRank(w) > 0).length;
  const total      = allWeapons.length;
  const maxRows    = Math.max(...cols.map(c => c.owned.length + c.notOwned.length));

  const totalW = PAD * 2 + cols.length * COL_W + (cols.length - 1) * (COL_GAP + DIVIDER_W);
  const colH   = LABEL_H + maxRows * (ROW_H + ROW_GAP) - ROW_GAP;
  const totalH = PAD + HEADER_H + SEC_GAP + colH + PAD;

  const { canvas, ctx } = makeCanvas(totalW, totalH);
  ctx.fillStyle = '#13141a';
  ctx.fillRect(0, 0, totalW, totalH);

  // Header
  ctx.textAlign = 'left';
  ctx.font = '600 14px "JetBrains Mono",monospace';
  ctx.fillStyle = '#f5d88a';
  ctx.fillText(`${totalOwned}/${total}`, PAD, PAD + 16);
  ctx.font = '500 9px "JetBrains Mono",monospace';
  ctx.fillStyle = '#45495a';
  ctx.fillText('WEAPONS OWNED', PAD, PAD + 29);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, PAD + HEADER_H - 6);
  ctx.lineTo(totalW - PAD, PAD + HEADER_H - 6);
  ctx.stroke();

  let xOff = PAD;
  const yBase = PAD + HEADER_H + SEC_GAP;

  for (let ci = 0; ci < cols.length; ci++) {
    const col = cols[ci];
    if (ci > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(xOff - COL_GAP - DIVIDER_W, yBase, DIVIDER_W, colH);
    }

    // Column label
    ctx.textAlign = 'left';
    ctx.font = '700 9px "JetBrains Mono",monospace';
    ctx.fillStyle = '#45495a';
    ctx.fillText(col.label.toUpperCase(), xOff, yBase + 12);
    ctx.font = '500 9px "JetBrains Mono",monospace';
    ctx.fillStyle = '#45495a';
    const countTxt = `${col.owned.length}/${col.owned.length + col.notOwned.length}`;
    ctx.fillText(countTxt, xOff + ctx.measureText(col.label.toUpperCase()).width + 5, yBase + 12);

    let yRow = yBase + LABEL_H;
    const drawRow = (w: import('@/data/weapons').Weapon, owned: boolean) => {
      const rank = getRank(w);
      if (owned) {
        rr(ctx, xOff, yRow, COL_W, ROW_H, 5);
        ctx.fillStyle = 'rgba(245,216,138,0.04)'; ctx.fill();
        ctx.strokeStyle = 'rgba(245,216,138,0.2)'; ctx.lineWidth = 0.75;
        rr(ctx, xOff + 0.5, yRow + 0.5, COL_W - 1, ROW_H - 1, 5); ctx.stroke();
      }

      const thumb = imgMap[w.file];
      if (thumb) {
        ctx.save();
        rr(ctx, xOff + 5, yRow + (ROW_H - THUMB_S) / 2, THUMB_S, THUMB_S, THUMB_R);
        ctx.clip();
        ctx.globalAlpha = owned ? 1 : 0.3;
        ctx.drawImage(thumb, xOff + 5, yRow + (ROW_H - THUMB_S) / 2, THUMB_S, THUMB_S);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      ctx.font = '500 10px "DM Sans",sans-serif';
      ctx.fillStyle = owned ? '#f5f0e8' : '#45495a';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const nameMaxW = COL_W - THUMB_S - 14 - (owned ? 28 : 0);
      let name = w.name;
      while (ctx.measureText(name).width > nameMaxW && name.length > 1) name = name.slice(0, -1);
      if (name !== w.name) name += '…';
      ctx.fillText(name, xOff + THUMB_S + 9, yRow + ROW_H / 2);

      if (owned) {
        const rText = `R${rank}`;
        ctx.font = '700 8px "JetBrains Mono",monospace';
        const rW = ctx.measureText(rText).width + 6;
        const bH = 14, bX = xOff + COL_W - rW - 4, bY = yRow + (ROW_H - bH) / 2;
        rr(ctx, bX, bY, rW, bH, 3);
        ctx.fillStyle = 'rgba(13,13,25,0.85)'; ctx.fill();
        ctx.strokeStyle = rank === 5 ? 'rgba(245,216,138,0.5)' : 'rgba(245,216,138,0.15)';
        ctx.lineWidth = 0.75;
        rr(ctx, bX, bY, rW, bH, 3); ctx.stroke();
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f5d88a';
        ctx.fillText(rText, bX + 3, bY + bH / 2);
      }
      ctx.textBaseline = 'alphabetic';
      yRow += ROW_H + ROW_GAP;
    };

    col.owned.forEach(w => drawRow(w, true));
    col.notOwned.forEach(w => drawRow(w, false));

    xOff += COL_W + COL_GAP + DIVIDER_W;
  }

  return exportCanvas(canvas);
}

export async function generateWeaponSnapshot(opts: WeaponSnapshotOptions): Promise<boolean> {
  return opts.snapView === 'list' ? weaponListSnapshot(opts) : weaponGallerySnapshot(opts);
}
