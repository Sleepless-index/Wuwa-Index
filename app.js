/* ─────────────────────────────────────────
   app.js — State, UI logic, and tracker rendering
   ───────────────────────────────────────── */

let activeFilter = "All";

/* ─── State ─── */
let versions = JSON.parse(JSON.stringify(HARDCODED));

const _saved = JSON.parse(localStorage.getItem("wuwa-tracker") || "{}");
let state            = _saved.state            || {};
let priority         = _saved.priority         || [];
let upcoming         = _saved.upcoming         || [];
let releasedUpcoming = _saved.releasedUpcoming || [];

releasedUpcoming.forEach(u => {
  const lastGroup = versions[versions.length - 1];
  if (!lastGroup.entries.find(e => e.id === u.uid)) {
    lastGroup.entries.push({ id: u.uid, ver: "?", name: u.name, element: u.element });
  }
});

let allEntries = versions.flatMap(g => g.entries);
const byId = () => Object.fromEntries(allEntries.map(e => [e.id, e]));

allEntries.forEach(e => {
  if (!state[e.id]) state[e.id] = { res: false, sig: false, seq: 0, wep: 0 };
  if (state[e.id].seq === undefined) state[e.id].seq = 0;
  if (state[e.id].wep === undefined) state[e.id].wep = 0;
});
priority = priority.filter(id => {
  const s = state[id];
  const upItem = upcoming.find(u => u.uid === id);
  return (allEntries.some(e => e.id === id) || upItem) && !s?.res;
});

let uidCounter = Math.max(100, ...upcoming.map(u => u.uid), ...releasedUpcoming.map(u => u.uid)) + 1;

function save() {
  localStorage.setItem("wuwa-tracker", JSON.stringify({ state, priority, upcoming, releasedUpcoming }));
}

/* ─── Stats & progress ─── */
function updateStats() {
  const total = allEntries.length;
  const got   = allEntries.filter(e => state[e.id]?.res).length;
  const sig   = allEntries.filter(e => state[e.id]?.wep > 0).length;
  document.getElementById("s-got").textContent      = got;
  document.getElementById("s-skip").textContent     = total - got;
  document.getElementById("s-sig").textContent      = sig;
  document.getElementById("s-priority").textContent = priority.length;
  const resPct = total ? Math.round((got / total) * 100) : 0;
  const sigPct = total ? Math.round((sig / total) * 100) : 0;
  document.getElementById("bar-res").style.width  = resPct + "%";
  document.getElementById("bar-sig").style.width  = sigPct + "%";
  document.getElementById("pct-res").textContent  = resPct + "%";
  document.getElementById("pct-sig").textContent  = sigPct + "%";
  updateElBreakdown();
  updateVersionCounts();
}

/* ─── Element breakdown ─── */
function updateElBreakdown() {
  const wrap = document.getElementById("el-breakdown");
  const counts = {};
  EL_ORDER.forEach(el => (counts[el] = { got: 0, total: 0 }));
  allEntries.forEach(e => {
    if (!e.element || !counts[e.element]) return;
    counts[e.element].total++;
    if (state[e.id]?.res) counts[e.element].got++;
  });

  if (!wrap.dataset.built) {
    wrap.dataset.built = "1";
    EL_ORDER.forEach(el => {
      const color = EL_COLORS[el];
      const card = document.createElement("div");
      card.className = "el-card";
      card.dataset.el = el;
      card.title = `Filter by ${el}`;
      card.innerHTML = `
        <div class="el-accent" style="background:${color}"></div>
        <img class="el-card-icon" src="icons/icon_${el}.webp" alt="${el}" onerror="this.style.display='none'">
        <div class="el-card-body">
          <div class="el-card-header">
            <span class="el-card-label" style="color:${color}">${el}</span>
            <span class="el-card-count" id="elcount-${el}">0 / 0</span>
          </div>
          <div class="el-card-track"><div class="el-card-fill" id="elbar-${el}" style="background:${color};width:0%"></div></div>
        </div>`;
      card.addEventListener("click", () => setFilter(el === activeFilter ? "All" : el));
      wrap.appendChild(card);
    });
  }

  EL_ORDER.forEach(el => {
    const { got, total } = counts[el];
    const pct = total ? Math.round((got / total) * 100) : 0;
    const bar = document.getElementById(`elbar-${el}`);
    const cnt = document.getElementById(`elcount-${el}`);
    if (bar) bar.style.width = pct + "%";
    if (cnt) cnt.textContent = `${got} / ${total}`;
    const cardEl = wrap.querySelector(`[data-el="${el}"]`);
    if (cardEl) {
      cardEl.style.opacity = activeFilter === "All" || activeFilter === el ? "1" : "0.4";
      cardEl.classList.toggle("active-filter", activeFilter === el);
    }
  });
}

function updateStyle(id) {
  const row = document.getElementById(`entry-${id}`);
  if (!row) return;
  row.classList.toggle("is-got",  !!state[id]?.res);
  row.classList.toggle("is-skip", !state[id]?.res);
}

/* ─── Sequence ─── */
function setSeq(id, val) {
  state[id].seq = state[id].seq === val ? 0 : val;
  save();
  for (let i = 0; i <= 6; i++) {
    const b = document.getElementById(`seq-${id}-${i}`);
    if (b) b.classList.toggle("active", i === state[id].seq);
  }
  const t = document.getElementById(`seq-toggle-${id}`);
  if (t) t.textContent = `S${state[id].seq > 0 ? state[id].seq : ""}`;
}

function refreshSeqBtns(id) {
  state[id].seq = 0;
  for (let i = 0; i <= 6; i++) {
    const b = document.getElementById(`seq-${id}-${i}`);
    if (b) b.classList.remove("active");
  }
  const t = document.getElementById(`seq-toggle-${id}`);
  if (t) { t.textContent = "S"; t.classList.remove("open"); }
  const p = document.getElementById(`seq-panel-${id}`);
  if (p) p.classList.remove("open");
}

/* ─── Weapon rank ─── */
function setWep(id, val) {
  state[id].wep = state[id].wep === val ? 0 : val;
  save();
  for (let i = 1; i <= 5; i++) {
    const b = document.getElementById(`wep-${id}-${i}`);
    if (b) b.classList.toggle("active", i === state[id].wep);
  }
  const t = document.getElementById(`wep-toggle-${id}`);
  if (t) t.textContent = `R${state[id].wep > 0 ? state[id].wep : ""}`;
  updateStats();
}

function refreshWepBtns(id) {
  state[id].wep = 0;
  for (let i = 1; i <= 5; i++) {
    const b = document.getElementById(`wep-${id}-${i}`);
    if (b) b.classList.remove("active");
  }
  const t = document.getElementById(`wep-toggle-${id}`);
  if (t) { t.textContent = "R"; t.classList.remove("open"); }
  const p = document.getElementById(`wep-panel-${id}`);
  if (p) p.classList.remove("open");
}

/* ─── Priority / Wishlist ─── */
function isPrioritized(id) { return priority.includes(id); }

function togglePriority(id) {
  if (state[id]?.res) return;
  if (isPrioritized(id)) priority = priority.filter(x => x !== id);
  else priority.push(id);
  save();
  const wb = document.getElementById(`wish-btn-${id}`);
  if (wb) wb.classList.toggle("prioritized", isPrioritized(id));
  renderPriority();
  updateStats();
}

function removeFromPriority(id) {
  priority = priority.filter(x => x !== id);
  save();
  const wb = document.getElementById(`wish-btn-${id}`);
  if (wb) wb.classList.remove("prioritized");
  renderPriority();
  updateStats();
}

let dragSrcId = null;

function renderPriority() {
  const list = document.getElementById("pr-list");
  list.innerHTML = "";
  if (priority.length === 0) {
    list.innerHTML = `<div class="priority-empty">No resonators prioritized — tap P on any unowned resonator to add it.</div>`;
    return;
  }
  const map = byId();
  priority.forEach((id, idx) => {
    const e = map[id] || upcoming.find(u => u.uid === id);
    if (!e) return;
    const isUp = !!upcoming.find(u => u.uid === id);
    const item = document.createElement("div");
    item.className = "pr-item";
    item.draggable = true;
    item.dataset.id = id;
    item.innerHTML = `
      <span class="pr-drag-handle">⠿</span>
      <span class="pr-rank">#${idx + 1}</span>
      <span class="pr-name">${e.name}</span>
      ${e.element ? `<span class="pr-el el-${e.element.toLowerCase()}">${e.element}</span>` : ""}
      ${isUp ? `<span class="pr-upcoming-tag">upcoming</span>` : ""}
      <button class="pr-remove" onclick="removeFromPriority(${id})" title="Remove">✕</button>`;

    item.addEventListener("dragstart", ev => {
      dragSrcId = id;
      ev.dataTransfer.effectAllowed = "move";
      setTimeout(() => item.classList.add("dragging"), 0);
    });
    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
      document.querySelectorAll(".pr-item").forEach(i => i.classList.remove("drag-over"));
    });
    item.addEventListener("dragover", ev => {
      ev.preventDefault();
      document.querySelectorAll(".pr-item").forEach(i => i.classList.remove("drag-over"));
      item.classList.add("drag-over");
    });
    item.addEventListener("drop", ev => {
      ev.preventDefault();
      if (dragSrcId === id) return;
      const fi = priority.indexOf(dragSrcId), ti = priority.indexOf(id);
      priority.splice(fi, 1);
      priority.splice(ti, 0, dragSrcId);
      save(); renderPriority(); updateStats();
    });
    item.addEventListener("touchstart", () => { dragSrcId = id; item.classList.add("dragging"); }, { passive: true });
    item.addEventListener("touchmove", ev => {
      ev.preventDefault();
      const t = ev.touches[0];
      const els = document.elementsFromPoint(t.clientX, t.clientY);
      const target = els.find(el => el.classList.contains("pr-item") && el !== item);
      document.querySelectorAll(".pr-item").forEach(i => i.classList.remove("drag-over"));
      if (target) target.classList.add("drag-over");
    }, { passive: false });
    item.addEventListener("touchend", ev => {
      item.classList.remove("dragging");
      const t = ev.changedTouches[0];
      const els = document.elementsFromPoint(t.clientX, t.clientY);
      const target = els.find(el => el.classList.contains("pr-item") && el !== item);
      document.querySelectorAll(".pr-item").forEach(i => i.classList.remove("drag-over"));
      if (target) {
        const fi = priority.indexOf(id);
        const toId = parseInt(target.dataset.id);
        const ti = priority.indexOf(toId);
        priority.splice(fi, 1);
        priority.splice(ti, 0, id);
        save(); renderPriority(); updateStats();
      }
    });
    list.appendChild(item);
  });
}

/* ─── Upcoming ─── */
function addUpcoming() {
  const nameEl = document.getElementById("up-name-input");
  const elEl   = document.getElementById("up-el-select");
  const name   = nameEl.value.trim();
  if (!name) { nameEl.focus(); return; }
  upcoming.push({ uid: uidCounter++, name, element: elEl.value || "" });
  save();
  nameEl.value = "";
  elEl.value = "";
  renderUpcoming();
}

function deleteUpcoming(uid) {
  upcoming = upcoming.filter(u => u.uid !== uid);
  priority = priority.filter(x => x !== uid);
  save(); renderUpcoming(); renderPriority(); updateStats();
}

let editingUid = null;
function openEditUpcoming(uid) {
  const u = upcoming.find(u => u.uid === uid);
  if (!u) return;
  editingUid = uid;
  document.getElementById("edit-up-name").value = u.name;
  document.getElementById("edit-up-el").value   = u.element || "";
  openModal("edit-upcoming");
}
function confirmEditUpcoming() {
  const u = upcoming.find(u => u.uid === editingUid);
  if (!u) return;
  const name = document.getElementById("edit-up-name").value.trim();
  if (!name) return;
  u.name    = name;
  u.element = document.getElementById("edit-up-el").value || "";
  save(); closeModal("edit-upcoming"); renderUpcoming(); renderPriority();
}

let releasingUid = null;
function openReleaseModal(uid) {
  const u = upcoming.find(u => u.uid === uid);
  if (!u) return;
  releasingUid = uid;
  document.getElementById("rel-name").value = u.name;
  document.getElementById("rel-el").value   = u.element || "";
  openModal("release");
}
function confirmRelease() {
  const u = upcoming.find(u => u.uid === releasingUid);
  if (!u) return;
  const name    = document.getElementById("rel-name").value.trim() || u.name;
  const element = document.getElementById("rel-el").value || u.element || "Spectro";
  const newEntry = { id: releasingUid, ver: "?", name, element };

  const lastGroup = versions[versions.length - 1];
  lastGroup.entries.push(newEntry);
  allEntries = versions.flatMap(g => g.entries);

  state[releasingUid] = { res: false, sig: false, seq: 0, wep: 0 };
  upcoming = upcoming.filter(u => u.uid !== releasingUid);
  releasedUpcoming.push({ uid: releasingUid, name, element });

  save();
  closeModal("release");
  document.getElementById("tracker").innerHTML = "";
  render(); renderPriority(); renderUpcoming(); updateStats();
}

function renderUpcoming() {
  const list = document.getElementById("up-list");
  list.innerHTML = "";
  if (upcoming.length === 0) {
    list.innerHTML = `<div class="up-empty">No upcoming characters added yet.</div>`;
    return;
  }
  upcoming.forEach(u => {
    const wled = isPrioritized(u.uid);
    const item = document.createElement("div");
    item.className = "up-item";
    item.innerHTML = `
      <span class="up-name">${u.name}</span>
      ${u.element
        ? `<span class="badge el-${u.element.toLowerCase()}">${u.element}</span>`
        : `<span style="font-size:0.65rem;color:var(--muted);font-family:JetBrains Mono,monospace">?</span>`}
      <div class="up-actions">
        <button class="up-btn wish-btn ${wled ? "prioritized" : ""}" id="wish-btn-${u.uid}" title="Priority" onclick="togglePriority(${u.uid})">★</button>
        <button class="up-btn edit-btn" title="Edit"            onclick="openEditUpcoming(${u.uid})">✎</button>
        <button class="up-btn rel-btn"  title="Mark as released" onclick="openReleaseModal(${u.uid})">✓</button>
        <button class="up-btn del-btn"  title="Delete"           onclick="deleteUpcoming(${u.uid})">✕</button>
      </div>`;
    list.appendChild(item);
  });
}

/* ─── Collapsibles ─── */
function makeCollapsible(headingId, bodyId) {
  const h = document.getElementById(headingId);
  const b = document.getElementById(bodyId);
  h.addEventListener("click", () => {
    const col = h.classList.toggle("collapsed");
    if (col) {
      b.style.maxHeight = b.scrollHeight + "px";
      requestAnimationFrame(() => b.classList.add("collapsed"));
    } else {
      b.classList.remove("collapsed");
      b.style.maxHeight = b.scrollHeight + "px";
      setTimeout(() => (b.style.maxHeight = "none"), 260);
    }
  });
  requestAnimationFrame(() => { b.style.maxHeight = "none"; });
}

/* ─── Collapse all / expand all ─── */
const versionElements = [];

function updateCollapseBtn() {
  const btn = document.getElementById("collapse-all-btn");
  if (!btn) return;
  btn.textContent = versionElements.every(v => v.heading.classList.contains("collapsed"))
    ? "expand all"
    : "collapse all";
}

function toggleAllVersions() {
  const allCollapsed = versionElements.every(v => v.heading.classList.contains("collapsed"));
  versionElements.forEach(({ heading, body }) => {
    if (allCollapsed) {
      heading.classList.remove("collapsed");
      body.classList.remove("collapsed");
      body.style.maxHeight = "none";
      setTimeout(() => body.classList.add("expanded"), 260);
    } else {
      body.classList.remove("expanded");
      body.style.maxHeight = body.scrollHeight + "px";
      requestAnimationFrame(() => {
        body.classList.add("collapsed");
        heading.classList.add("collapsed");
      });
    }
  });
  setTimeout(updateCollapseBtn, 50);
}

function updateVersionCounts() {
  versions.forEach(({ entries }, i) => {
    const v = versionElements[i];
    if (!v) return;
    const got = entries.filter(e => state[e.id]?.res).length;
    const countEl = v.heading.querySelector(".version-count");
    if (countEl) countEl.textContent = `${got}/${entries.length}`;
  });
}

/* ─── Element filter ─── */
function setFilter(el) {
  activeFilter = el;
  applyFilter();
  updateElBreakdown();
}

function applyFilter() {
  allEntries.forEach(e => {
    const w = document.getElementById(`wrap-${e.id}`);
    if (!w) return;
    w.classList.toggle("el-hidden", activeFilter !== "All" && e.element !== activeFilter);
  });
  document.querySelectorAll(".version-group").forEach(grp => {
    const any = [...grp.querySelectorAll(".entry-wrap")].some(w => !w.classList.contains("el-hidden"));
    grp.classList.toggle("hidden", !any);
  });
}

/* ─── Render tracker ─── */
function render() {
  const container = document.getElementById("tracker");
  versionElements.length = 0;

  versions.forEach(({ label, entries }) => {
    const group   = document.createElement("div"); group.className = "version-group";
    const heading = document.createElement("div"); heading.className = "version-heading";
    const body    = document.createElement("div"); body.className = "version-body";

    const got = entries.filter(e => state[e.id]?.res).length;
    heading.innerHTML = `<span>${label}</span><span class="version-count">${got}/${entries.length}</span><span class="chevron">▼</span>`;
    versionElements.push({ heading, body });

    heading.addEventListener("click", () => {
      const col = heading.classList.toggle("collapsed");
      if (col) {
        body.classList.remove("expanded");
        body.style.maxHeight = body.scrollHeight + "px";
        requestAnimationFrame(() => body.classList.add("collapsed"));
      } else {
        body.classList.remove("collapsed");
        body.style.maxHeight = body.scrollHeight + "px";
        setTimeout(() => { body.style.maxHeight = "none"; body.classList.add("expanded"); }, 260);
      }
      updateCollapseBtn();
    });

    entries.forEach(e => {
      if (!state[e.id]) state[e.id] = { res: false, sig: false, seq: 0, wep: 0 };
      if (state[e.id].wep === undefined) state[e.id].wep = 0;
      const s    = state[e.id];
      const wled = isPrioritized(e.id);
      const entryWrap = document.createElement("div");
      entryWrap.className = "entry-wrap";
      entryWrap.id = `wrap-${e.id}`;

      const row = document.createElement("div");
      row.className = `entry ${s.res ? "is-got" : "is-skip"}`;
      row.id = `entry-${e.id}`;

      // Checkbox
      const cbWrap = document.createElement("div"); cbWrap.className = "cb-wrap";
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.className = "cb cb-res"; cb.id = `res-${e.id}`; cb.checked = !!s.res;
      cbWrap.appendChild(cb);

      // Head icon
      const headImg = document.createElement("img"); headImg.className = "res-head-icon";
      headImg.src = `icons/head_${e.name.replace(/[^a-zA-Z0-9]/g, "_")}.webp`; headImg.alt = "";
      headImg.onerror = function () { this.style.display = "none"; };

      // Name + element badge
      const resInfo = document.createElement("div"); resInfo.className = "res-info";
      resInfo.innerHTML = `<span class="res-name">${e.name}</span>${
        e.element
          ? `<span class="badge el-${e.element.toLowerCase()}"><img class="badge-icon" src="icons/icon_${e.element}.webp" alt="${e.element}" onerror="this.style.display='none'">${e.element}</span>`
          : ""}`;

      // Sequence button + dropdown
      const seqWrap   = document.createElement("div"); seqWrap.className = "seq-toggle-wrap";
      const seqToggle = document.createElement("button");
      seqToggle.className = "seq-toggle"; seqToggle.id = `seq-toggle-${e.id}`; seqToggle.title = "Sequence";
      seqToggle.textContent = `S${s.seq > 0 ? s.seq : ""}`;
      const seqPanel = document.createElement("div");
      seqPanel.className = "seq-panel"; seqPanel.id = `seq-panel-${e.id}`;
      let seqHTML = `<span class="seq-label">seq</span>`;
      for (let i = 0; i <= 6; i++)
        seqHTML += `<button class="seq-btn ${s.seq === i ? "active" : ""}" id="seq-${e.id}-${i}" onclick="setSeq(${e.id},${i})">${i}</button>`;
      seqPanel.innerHTML = seqHTML;
      seqWrap.appendChild(seqToggle); seqWrap.appendChild(seqPanel);

      // Weapon rank button + dropdown
      const wepWrap   = document.createElement("div"); wepWrap.className = "wep-toggle-wrap";
      const wepToggle = document.createElement("button");
      wepToggle.className = "wep-toggle"; wepToggle.id = `wep-toggle-${e.id}`; wepToggle.title = "Weapon rank";
      wepToggle.textContent = `R${s.wep > 0 ? s.wep : ""}`;
      const wepPanel = document.createElement("div");
      wepPanel.className = "wep-panel"; wepPanel.id = `wep-panel-${e.id}`;
      let wepHTML = `<span class="seq-label" style="color:var(--sig)">rank</span>`;
      for (let i = 1; i <= 5; i++)
        wepHTML += `<button class="wep-btn ${s.wep === i ? "active" : ""}" id="wep-${e.id}-${i}" onclick="setWep(${e.id},${i})">${i}</button>`;
      wepPanel.innerHTML = wepHTML;
      wepWrap.appendChild(wepToggle); wepWrap.appendChild(wepPanel);

      // Priority button
      const starBtn = document.createElement("button");
      starBtn.className = `wish-btn${wled ? " prioritized" : ""}`;
      starBtn.id = `wish-btn-${e.id}`; starBtn.title = "Priority"; starBtn.textContent = "P";
      starBtn.onclick = () => togglePriority(e.id);

      row.appendChild(cbWrap); row.appendChild(headImg); row.appendChild(resInfo);
      row.appendChild(seqWrap); row.appendChild(wepWrap); row.appendChild(starBtn);
      entryWrap.appendChild(row);

      // Panel open/close events
      const updatePanelOpenClass = () => {
        row.classList.toggle("panel-open",
          seqPanel.classList.contains("open") || wepPanel.classList.contains("open"));
      };
      seqToggle.addEventListener("click", ev => {
        ev.stopPropagation();
        const wasOpen = seqPanel.classList.contains("open");
        closeAllPanels();
        if (!wasOpen) { seqPanel.classList.add("open"); seqToggle.classList.add("open"); }
        updatePanelOpenClass();
      });
      seqToggle.addEventListener("touchstart", ev => ev.stopPropagation(), { passive: true });
      wepToggle.addEventListener("click", ev => {
        ev.stopPropagation();
        const wasOpen = wepPanel.classList.contains("open");
        closeAllPanels();
        if (!wasOpen) { wepPanel.classList.add("open"); wepToggle.classList.add("open"); }
        updatePanelOpenClass();
      });
      wepToggle.addEventListener("touchstart", ev => ev.stopPropagation(), { passive: true });
      seqPanel.addEventListener("click",      ev => ev.stopPropagation());
      wepPanel.addEventListener("click",      ev => ev.stopPropagation());
      seqPanel.addEventListener("touchstart", ev => ev.stopPropagation(), { passive: true });
      wepPanel.addEventListener("touchstart", ev => ev.stopPropagation(), { passive: true });

      // Checkbox change
      cb.addEventListener("change", ev => {
        state[e.id].res = ev.target.checked;
        if (!ev.target.checked) {
          state[e.id].seq = 0; refreshSeqBtns(e.id);
          state[e.id].wep = 0; refreshWepBtns(e.id);
        }
        if (ev.target.checked && isPrioritized(e.id)) {
          priority = priority.filter(x => x !== e.id);
          renderPriority();
        }
        const wb = document.getElementById(`wish-btn-${e.id}`);
        if (wb) wb.classList.toggle("prioritized", isPrioritized(e.id));
        save(); updateStyle(e.id); updateStats();
      });

      body.appendChild(entryWrap);
    });

    group.appendChild(heading); group.appendChild(body); container.appendChild(group);
    requestAnimationFrame(() => { body.style.maxHeight = "none"; body.classList.add("expanded"); });
  });

  updateStats();
}

/* ─── Reset ─── */
function resetAll() {
  if (!confirm("Reset everything including priority and upcoming?")) return;
  allEntries.forEach(e => {
    state[e.id] = { res: false, sig: false, seq: 0, wep: 0 };
    const r  = document.getElementById(`res-${e.id}`);
    const wb = document.getElementById(`wish-btn-${e.id}`);
    if (r)  r.checked = false;
    if (wb) wb.classList.remove("prioritized");
    updateStyle(e.id); refreshSeqBtns(e.id); refreshWepBtns(e.id);
  });
  priority = []; upcoming = []; releasedUpcoming = [];
  versions   = JSON.parse(JSON.stringify(HARDCODED));
  allEntries = versions.flatMap(g => g.entries);
  localStorage.removeItem("wuwa-tracker");
  save(); renderPriority(); renderUpcoming(); updateStats();
}

/* ─── Export / Import ─── */
function openModal(type) {
  if (type === "export") {
    document.getElementById("export-text").value = JSON.stringify({ state, priority, upcoming, releasedUpcoming }, null, 2);
    document.getElementById("export-msg").textContent = "";
  } else if (type === "import") {
    document.getElementById("import-text").value = "";
    document.getElementById("import-msg").textContent = "";
  }
  document.getElementById(`modal-${type}`).classList.add("open");
}

function closeModal(type) {
  document.getElementById(`modal-${type}`).classList.remove("open");
}

function copyExport() {
  const ta = document.getElementById("export-text");
  ta.select();
  navigator.clipboard.writeText(ta.value).then(() => {
    const m = document.getElementById("export-msg");
    m.textContent = "Copied!"; m.className = "modal-msg";
    setTimeout(() => (m.textContent = ""), 2000);
  });
}

function doImport() {
  const raw = document.getElementById("import-text").value.trim();
  const msg = document.getElementById("import-msg");
  try {
    const p       = JSON.parse(raw);
    const pState  = p.state || p;
    const pWish   = Array.isArray(p.priority)         ? p.priority         : [];
    const pUp     = Array.isArray(p.upcoming)         ? p.upcoming         : [];
    const pRel    = Array.isArray(p.releasedUpcoming) ? p.releasedUpcoming : [];
    if (typeof pState !== "object" || Array.isArray(pState)) throw new Error();

    versions = JSON.parse(JSON.stringify(HARDCODED));
    pRel.forEach(u => {
      const last = versions[versions.length - 1];
      if (!last.entries.find(e => e.id === u.uid))
        last.entries.push({ id: u.uid, ver: "?", name: u.name, element: u.element });
    });
    allEntries = versions.flatMap(g => g.entries);

    state = {};
    allEntries.forEach(e => {
      const d = pState[e.id] || pState[String(e.id)];
      state[e.id] = {
        res: !!d?.res, sig: !!d?.sig,
        seq: typeof d?.seq === "number" ? d.seq : 0,
        wep: typeof d?.wep === "number" ? d.wep : 0,
      };
    });
    upcoming = pUp; releasedUpcoming = pRel;
    priority = pWish.filter(id => allEntries.some(e => e.id === id) || upcoming.find(u => u.uid === id));
    uidCounter = Math.max(100, ...upcoming.map(u => u.uid), ...releasedUpcoming.map(u => u.uid)) + 1;

    save();
    document.getElementById("tracker").innerHTML = "";
    render();

    allEntries.forEach(e => {
      const r  = document.getElementById(`res-${e.id}`);
      const wb = document.getElementById(`wish-btn-${e.id}`);
      if (r)  r.checked = state[e.id].res;
      if (wb) wb.classList.toggle("prioritized", isPrioritized(e.id));
      updateStyle(e.id); refreshSeqBtns(e.id); refreshWepBtns(e.id);
      if (state[e.id].seq > 0) {
        const t   = document.getElementById(`seq-toggle-${e.id}`);
        const btn = document.getElementById(`seq-${e.id}-${state[e.id].seq}`);
        if (t)   t.textContent = `S${state[e.id].seq}`;
        if (btn) btn.classList.add("active");
      }
      if (state[e.id].wep > 0) {
        const t   = document.getElementById(`wep-toggle-${e.id}`);
        const btn = document.getElementById(`wep-${e.id}-${state[e.id].wep}`);
        if (t)   t.textContent = `R${state[e.id].wep}`;
        if (btn) btn.classList.add("active");
      }
    });
    renderPriority(); renderUpcoming(); updateStats();
    msg.textContent = "Import successful!"; msg.className = "modal-msg";
    setTimeout(() => closeModal("import"), 1200);
  } catch {
    msg.textContent = "Invalid data — please paste a valid export.";
    msg.className = "modal-msg err";
  }
}

/* ─── Init ─── */
["export", "import", "edit-upcoming", "release"].forEach(t => {
  document.getElementById(`modal-${t}`).addEventListener("click", function (e) {
    if (e.target === this) closeModal(t);
  });
});

document.getElementById("up-name-input").addEventListener("keydown", e => {
  if (e.key === "Enter") addUpcoming();
});

makeCollapsible("pr-heading", "pr-body");
makeCollapsible("up-heading", "up-body");
document.getElementById("up-heading").classList.add("collapsed");
document.getElementById("up-body").classList.add("collapsed");
document.getElementById("up-body").style.maxHeight = "0";
render();
renderPriority();
renderUpcoming();

/* ─── Close panels on outside click ─── */
function closeAllPanels() {
  document.querySelectorAll(".seq-panel.open, .wep-panel.open").forEach(p => p.classList.remove("open"));
  document.querySelectorAll(".seq-toggle.open, .wep-toggle.open").forEach(t => t.classList.remove("open"));
  document.querySelectorAll(".entry.panel-open").forEach(r => r.classList.remove("panel-open"));
}
document.addEventListener("click", closeAllPanels);
document.addEventListener("touchstart", closeAllPanels, { passive: true });
