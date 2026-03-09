/* ─────────────────────────────────────────
   snapshot.js — Snapshot modal, preview rendering, and Canvas PNG export
   ───────────────────────────────────────── */

let snapView = "gallery";

/* ─── View toggle ─── */
function setSnapView(v) {
  snapView = v;
  document.getElementById("snap-view-regions").classList.toggle("active", v === "regions");
  document.getElementById("snap-view-gallery").classList.toggle("active", v === "gallery");
  renderSnapContent();
}

function openSnapshot() {
  document.getElementById("modal-snapshot").classList.add("open");
  renderSnapGallery();
}

function closeSnapshot() {
  document.getElementById("modal-snapshot").classList.remove("open");
}

function renderSnapContent() {
  snapView === "gallery" ? renderSnapGallery() : renderSnapRegions();
}

/* ─── Card HTML (gallery view) ─── */
function makeSnapCard(e) {
  const s       = state[e.id] || { res: false, seq: 0, wep: 0 };
  const cls     = s.res ? "obtained" : "not-pulled";
  const isMaxS  = s.seq === 6;
  const isMaxR  = s.wep === 5;
  const tag     = s.res
    ? `<div class="snap-card-tag ${isMaxS ? "s-max" : ""} ${isMaxR ? "r-max" : ""}">
         <span class="s-part">S${s.seq || 0}</span>
         <span class="r-part">R${s.wep || 0}</span>
       </div>`
    : "";
  const safe = e.name.replace(/[^a-zA-Z0-9]/g, "_");
  const art  = `<img class="snap-art" src="art/art_${safe}.avif" alt=""
                  onerror="this.src='icons/head_${safe}.webp';">`;
  return `<div class="snap-card ${cls}">${art}${tag}<div class="snap-card-name">${e.name}</div></div>`;
}

/* ─── Stats header HTML shared by both views ─── */
function snapStatsHTML() {
  const total = allEntries.length;
  const got   = allEntries.filter(e => state[e.id]?.res).length;
  const sig   = allEntries.filter(e => state[e.id]?.wep > 0).length;
  return `
    <div class="snap-header">
      <div class="snap-stats">
        <div class="snap-stat">
          <span class="snap-stat-num res">${got}/${total}</span>
          <span class="snap-stat-label">resonators</span>
        </div>
        <div class="snap-stat">
          <span class="snap-stat-num sig">${sig}/${total}</span>
          <span class="snap-stat-label">sig weapons</span>
        </div>
      </div>
    </div>`;
}

/* ─── Gallery view (owned / not-owned buckets) ─── */
function renderSnapGallery() {
  const ownedOnly = document.getElementById("snap-owned-only")?.checked;
  const owned     = allEntries.filter(e =>  state[e.id]?.res);
  const notOwned  = allEntries.filter(e => !state[e.id]?.res);

  let html = snapStatsHTML() + `<div class="snap-ver-grid">`;

  html += `<div class="snap-ver-col">
    <div class="snap-ver-label">owned <span class="snap-ver-count">${owned.length}</span></div>
    <div class="snap-row-list">${owned.map(makeSnapCard).join("")}</div>
  </div>`;

  if (!ownedOnly && notOwned.length) {
    html += `<div class="snap-ver-col">
      <div class="snap-ver-label">not owned <span class="snap-ver-count">${notOwned.length}</span></div>
      <div class="snap-row-list">${notOwned.map(makeSnapCard).join("")}</div>
    </div>`;
  }

  html += `</div>`;
  document.getElementById("snap-card-content").innerHTML = html;
}

/* ─── Regions / list view (version columns) ─── */
function renderSnapRegions() {
  const ownedOnly = document.getElementById("snap-owned-only")?.checked;

  const visibleVersions = versions.filter(({ entries }) =>
    !ownedOnly || entries.some(e => state[e.id]?.res)
  );

  let html = snapStatsHTML() +
    `<div class="snap-ver-grid-list" style="--snap-cols:${visibleVersions.length}">`;

  visibleVersions.forEach(({ label, entries }) => {
    const filtered = ownedOnly ? entries.filter(e => state[e.id]?.res) : entries;
    const verGot   = entries.filter(e => state[e.id]?.res).length;
    html += `<div class="snap-ver-col-list">
      <div class="snap-ver-label">${label} <span class="snap-ver-count">${verGot}/${entries.length}</span></div>
      <div class="snap-row-list-old">`;

    filtered.forEach(e => {
      const s        = state[e.id] || { res: false, seq: 0, wep: 0 };
      const cls      = s.res ? "obtained" : "not-pulled";
      const seqPart  = s.res ? `S${s.seq}` : (s.seq > 0 ? `S${s.seq}` : "");
      const wepPart  = s.res ? `R${s.wep}` : (s.wep > 0 ? `R${s.wep}` : "");
      const comboTag = (seqPart || wepPart)
        ? `<span class="snap-seq">${seqPart}${wepPart}</span>`
        : "";
      const safe = e.name.replace(/[^a-zA-Z0-9]/g, "_");
      const icon = `<img class="snap-head-icon" src="icons/head_${safe}.webp" alt="" onerror="this.style.display='none'">`;
      html += `<div class="snap-row ${cls}">${icon}<span class="snap-row-name">${e.name}</span>${comboTag}</div>`;
    });

    html += `</div></div>`;
  });

  html += `</div>`;
  document.getElementById("snap-card-content").innerHTML = html;
}

/* ─────────────────────────────────────────────────────────────────
   Canvas PNG export — 2× DPR, gallery or regions mode
   ───────────────────────────────────────────────────────────────── */
async function copySnapshot() {
  const btn = document.getElementById("snap-copy-btn");
  const msg = document.getElementById("snap-export-msg");
  btn.textContent = "generating…";
  btn.disabled = true;
  if (msg) { msg.textContent = ""; msg.className = "snap-export-msg"; }

  try {
    const DPR      = 2;
    const PAD      = 24;
    const HEADER_H = 48;
    const ownedOnly = document.getElementById("snap-owned-only")?.checked;

    /* Image loader with cache */
    const cache = {};
    const loadImg = src => cache[src] || (cache[src] = new Promise(res => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload  = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    }));

    /* Preload head icons (both modes need them) */
    const headMap = {};
    await Promise.all(allEntries.map(async e => {
      const n = e.name.replace(/[^a-zA-Z0-9]/g, "_");
      headMap[e.id] = await loadImg(`icons/head_${n}.webp`);
    }));

    /* Canvas factory at 2× DPR */
    const makeCanvas = (w, h) => {
      const c = document.createElement("canvas");
      c.width = w * DPR; c.height = h * DPR;
      const x = c.getContext("2d"); x.scale(DPR, DPR);
      return { canvas: c, ctx: x };
    };

    /* Rounded-rect path helper */
    const rr = (ctx, x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    /* Stats header row drawn on canvas */
    const drawHeader = (ctx, totalW, got, total, sig) => {
      ctx.textAlign = "right";
      ctx.font = '600 14px "JetBrains Mono",monospace';
      ctx.fillStyle = "#89d9a0";
      ctx.fillText(`${got}/${total}`, totalW - PAD, PAD + 16);
      ctx.font = '500 9px "JetBrains Mono",monospace';
      ctx.fillStyle = "#45495a";
      ctx.fillText("RESONATORS", totalW - PAD, PAD + 29);
      ctx.font = '600 14px "JetBrains Mono",monospace';
      ctx.fillStyle = "#7eb8f7";
      ctx.fillText(`${sig}/${total}`, totalW - PAD - 120, PAD + 16);
      ctx.font = '500 9px "JetBrains Mono",monospace';
      ctx.fillStyle = "#45495a";
      ctx.fillText("SIG WEAPONS", totalW - PAD - 120, PAD + 29);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, PAD + HEADER_H - 6);
      ctx.lineTo(totalW - PAD, PAD + HEADER_H - 6);
      ctx.stroke();
    };

    const total = allEntries.length;
    const got   = allEntries.filter(e => state[e.id]?.res).length;
    const sig   = allEntries.filter(e => state[e.id]?.wep > 0).length;

    /* ════════════════════════════════════
       GALLERY MODE — card grid
       ════════════════════════════════════ */
    if (snapView === "gallery") {
      const CARD_W = 110, CARD_H = 160, CARD_GAP = 6, CARD_R = 10;
      const COLS   = 6,   LABEL_H = 22, SEC_GAP = 20;

      /* Preload art images, fall back to head icons */
      const imgMap = {};
      await Promise.all(allEntries.map(async e => {
        const n = e.name.replace(/[^a-zA-Z0-9]/g, "_");
        imgMap[e.id] = (await loadImg(`art/art_${n}.avif`)) || headMap[e.id];
      }));

      const owned    = allEntries.filter(e =>  state[e.id]?.res);
      const notOwned = allEntries.filter(e => !state[e.id]?.res);
      const sections = [];
      if (owned.length)               sections.push({ label: `owned · ${owned.length}`,        entries: owned });
      if (!ownedOnly && notOwned.length) sections.push({ label: `not owned · ${notOwned.length}`, entries: notOwned });

      const totalW = PAD * 2 + COLS * CARD_W + (COLS - 1) * CARD_GAP;
      let totalH   = PAD + HEADER_H;
      sections.forEach(s => {
        const rows = Math.ceil(s.entries.length / COLS);
        totalH += SEC_GAP + LABEL_H + rows * (CARD_H + CARD_GAP) - CARD_GAP;
      });
      totalH += PAD;

      const { canvas, ctx } = makeCanvas(totalW, totalH);
      ctx.fillStyle = "#1d1f23";
      ctx.fillRect(0, 0, totalW, totalH);
      drawHeader(ctx, totalW, got, total, sig);

      let yOff = PAD + HEADER_H;
      for (const sec of sections) {
        yOff += SEC_GAP;
        ctx.textAlign = "left";
        ctx.font = '500 9px "JetBrains Mono",monospace';
        ctx.fillStyle = "#6b6985";
        ctx.fillText(sec.label.toUpperCase(), PAD, yOff + 13);
        yOff += LABEL_H;

        for (let i = 0; i < sec.entries.length; i++) {
          const e  = sec.entries[i];
          const s  = state[e.id] || { res: false, seq: 0, wep: 0 };
          const cx = PAD + (i % COLS) * (CARD_W + CARD_GAP);
          const cy = yOff + Math.floor(i / COLS) * (CARD_H + CARD_GAP);

          /* Card clip + art */
          ctx.save();
          rr(ctx, cx, cy, CARD_W, CARD_H, CARD_R);
          ctx.clip();
          ctx.fillStyle = "#262a33";
          ctx.fillRect(cx, cy, CARD_W, CARD_H);
          const img = imgMap[e.id];
          if (img) {
            ctx.globalAlpha = s.res ? 1 : 0.3;
            ctx.drawImage(img, cx, cy, CARD_W, CARD_H);
            ctx.globalAlpha = 1;
          }

          /* Gradient overlay */
          const grad = ctx.createLinearGradient(cx, cy + CARD_H * 0.35, cx, cy + CARD_H);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(1, "rgba(8,10,14,0.93)");
          ctx.fillStyle = grad;
          ctx.fillRect(cx, cy, CARD_W, CARD_H);
          ctx.restore();

          /* Card border */
          rr(ctx, cx + 0.75, cy + 0.75, CARD_W - 1.5, CARD_H - 1.5, CARD_R);
          ctx.strokeStyle = s.res ? "rgba(126,184,247,0.45)" : "rgba(54,60,71,0.8)";
          ctx.lineWidth = s.res ? 1.5 : 1;
          ctx.stroke();

          /* Name */
          ctx.font = '600 10px "DM Sans",sans-serif';
          ctx.fillStyle = s.res ? "#f5f0e8" : "#45495a";
          ctx.textAlign = "center";
          let name = e.name;
          while (ctx.measureText(name).width > CARD_W - 10 && name.length > 1) name = name.slice(0, -1);
          if (name !== e.name) name += "…";
          ctx.fillText(name, cx + CARD_W / 2, cy + CARD_H - 7);

          /* S/R badge */
          if (s.res) {
            const isMaxS = s.seq === 6, isMaxR = s.wep === 5;
            const sText = `S${s.seq || 0}`, rText = `R${s.wep || 0}`;
            const BFONT = '800 8px "JetBrains Mono",monospace';
            ctx.font = BFONT;
            const sW = ctx.measureText(sText).width + 10;
            ctx.font = '500 8px "JetBrains Mono",monospace';
            const rW = ctx.measureText(rText).width + 10;
            const bH = 14, bX = cx + 6, bY = cy + 6;
            rr(ctx, bX, bY, sW + rW, bH, 3);
            ctx.fillStyle = "rgba(13,13,25,0.88)"; ctx.fill();
            ctx.strokeStyle = (isMaxS && isMaxR) ? "rgba(245,216,138,0.7)" : "rgba(255,255,255,0.08)";
            ctx.lineWidth = 0.75; rr(ctx, bX, bY, sW + rW, bH, 3); ctx.stroke();
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillStyle = isMaxS ? "#f5d88a" : "#b794f4"; ctx.font = BFONT;
            ctx.fillText(sText, bX + sW / 2, bY + bH / 2);
            ctx.fillStyle = isMaxR ? "#f5d88a" : "#7eb8f7"; ctx.font = '500 8px "JetBrains Mono",monospace';
            ctx.fillText(rText, bX + sW + rW / 2, bY + bH / 2);
            ctx.textBaseline = "alphabetic";
          }
        }

        const rows = Math.ceil(sec.entries.length / COLS);
        yOff += rows * (CARD_H + CARD_GAP) - CARD_GAP;
      }

      _exportCanvas(canvas, btn);

    /* ════════════════════════════════════
       REGIONS MODE — version column list
       ════════════════════════════════════ */
    } else {
      const ROW_H   = 28, ROW_GAP = 3;
      const ICON_S  = 22, ICON_R  = 4;
      const COL_W   = 160, COL_GAP = 1;
      const LABEL_H = 20, SEC_GAP = 16;
      const DIVIDER_W = 1;

      const visCols = versions.map(({ label, entries }) => {
        const filtered = ownedOnly ? entries.filter(e => state[e.id]?.res) : entries;
        const verGot   = entries.filter(e => state[e.id]?.res).length;
        return { label, count: `${verGot}/${entries.length}`, entries: filtered };
      }).filter(c => c.entries.length > 0);

      const totalW  = PAD * 2 + visCols.length * COL_W + (visCols.length - 1) * (COL_GAP + DIVIDER_W);
      const maxRows = Math.max(...visCols.map(c => c.entries.length));
      const colH    = LABEL_H + maxRows * (ROW_H + ROW_GAP) - ROW_GAP;
      const totalH  = PAD + HEADER_H + SEC_GAP + colH + PAD;

      const { canvas, ctx } = makeCanvas(totalW, totalH);
      ctx.fillStyle = "#1d1f23";
      ctx.fillRect(0, 0, totalW, totalH);
      drawHeader(ctx, totalW, got, total, sig);

      let xOff  = PAD;
      const yBase = PAD + HEADER_H + SEC_GAP;

      for (let ci = 0; ci < visCols.length; ci++) {
        const col = visCols[ci];

        /* Divider between columns */
        if (ci > 0) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(xOff - COL_GAP - DIVIDER_W, yBase, DIVIDER_W, colH);
        }

        /* Version label */
        ctx.textAlign = "left";
        ctx.font = '700 9px "JetBrains Mono",monospace';
        ctx.fillStyle = "#6b6985";
        ctx.fillText(col.label.toUpperCase(), xOff, yBase + 12);
        ctx.font = '500 9px "JetBrains Mono",monospace';
        ctx.fillStyle = "#45495a";
        ctx.fillText(col.count, xOff + ctx.measureText(col.label.toUpperCase()).width + 5, yBase + 12);

        let yRow = yBase + LABEL_H;

        for (const e of col.entries) {
          const s = state[e.id] || { res: false, seq: 0, wep: 0 };

          /* Obtained row highlight */
          if (s.res) {
            rr(ctx, xOff, yRow, COL_W, ROW_H, 5);
            ctx.fillStyle = "rgba(126,184,247,0.05)"; ctx.fill();
            ctx.strokeStyle = "rgba(126,184,247,0.2)"; ctx.lineWidth = 0.75;
            rr(ctx, xOff + 0.5, yRow + 0.5, COL_W - 1, ROW_H - 1, 5); ctx.stroke();
          }

          /* Head icon */
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

          /* Name */
          ctx.font = '500 10px "DM Sans",sans-serif';
          ctx.fillStyle = s.res ? "#f5f0e8" : "#45495a";
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          let name = e.name;
          const maxNameW = COL_W - ICON_S - 14 - (s.res ? 40 : 0);
          while (ctx.measureText(name).width > maxNameW && name.length > 1) name = name.slice(0, -1);
          if (name !== e.name) name += "…";
          ctx.fillText(name, xOff + ICON_S + 9, yRow + ROW_H / 2);

          /* S/R tag */
          if (s.res) {
            const seqTxt = `S${s.seq || 0}`, wepTxt = `R${s.wep || 0}`;
            const tagFont = '700 8px "JetBrains Mono",monospace';
            ctx.font = tagFont;
            const tagW = ctx.measureText(seqTxt + wepTxt).width + 12;
            const tagH = 14, tagX = xOff + COL_W - tagW - 4, tagY = yRow + (ROW_H - tagH) / 2;
            rr(ctx, tagX, tagY, tagW, tagH, 3);
            ctx.fillStyle = "rgba(13,13,25,0.85)"; ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 0.75;
            rr(ctx, tagX, tagY, tagW, tagH, 3); ctx.stroke();
            ctx.textBaseline = "middle";
            const sW = ctx.measureText(seqTxt).width;
            ctx.fillStyle = s.seq === 6 ? "#f5d88a" : "#b794f4"; ctx.textAlign = "left";
            ctx.fillText(seqTxt, tagX + 5, tagY + tagH / 2);
            ctx.fillStyle = s.wep === 5 ? "#f5d88a" : "#7eb8f7";
            ctx.fillText(wepTxt, tagX + 5 + sW + 2, tagY + tagH / 2);
          }

          ctx.textBaseline = "alphabetic";
          yRow += ROW_H + ROW_GAP;
        }

        xOff += COL_W + COL_GAP + DIVIDER_W;
      }

      _exportCanvas(canvas, btn);
    }

  } catch (err) {
    console.error("Snapshot error:", err);
    const msg = document.getElementById("snap-export-msg");
    if (msg) { msg.textContent = "✕ failed"; msg.className = "snap-export-msg err"; }
    btn.textContent = "⎘ copy + save";
    btn.disabled = false;
    setTimeout(() => { if (msg) msg.textContent = ""; }, 2500);
  }
}

/* ─── Shared canvas → clipboard + download ─── */
function _exportCanvas(canvas, btn) {
  canvas.toBlob(async blob => {
    let copied = false;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      copied = true;
    } catch { /* clipboard write not supported or denied */ }
    const a = document.createElement("a");
    a.download = "wuwa-snapshot.png";
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    const msg = document.getElementById("snap-export-msg");
    const result = copied ? "✓ copied + saved!" : "✓ saved!";
    if (msg) { msg.textContent = result; msg.className = "snap-export-msg"; }
    btn.textContent = "⎘ copy + save";
    btn.disabled = false;
    setTimeout(() => { if (msg) msg.textContent = ""; }, 2500);
  }, "image/png");
}
