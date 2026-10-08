const ICON = {
  water: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c-.3 0-.6.2-.8.4C9.4 5.3 5.5 10.6 5.5 14.5a6.5 6.5 0 0 0 13 0c0-3.9-3.9-9.2-5.7-11.6-.2-.2-.5-.4-.8-.4z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 1.8v2.6M12 19.6v2.6M1.8 12h2.6M19.6 12h2.6M4.8 4.8l1.8 1.8M17.4 17.4l1.8 1.8M4.8 19.2l1.8-1.8M17.4 6.6l1.8-1.8"/></svg>',
  soil: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 14h18l-2 7H5z"/><circle cx="8" cy="10.5" r="2"/><circle cx="13" cy="9" r="2.4"/><circle cx="17.5" cy="11" r="1.7"/></svg>',
  friend: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.3-9.4C1.4 8 3.7 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.7 1.2-1.6 2.8-2.7 4.8-2.7 3.5 0 5.8 3.5 4.5 7.1C19.5 16.4 12 21 12 21z"/></svg>',
  foe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
  feed: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v3l3 4v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9l3-4z"/></svg>',
  prune: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8 16L19 3M16 16L5 3"/></svg>',
};
const SWASH = '<svg class="swash" viewBox="0 0 92 9" aria-hidden="true"><path d="M2 6 C 22 2, 44 8, 62 4 S 84 3, 90 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".55"/></svg>';
const RING = '<svg class="ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M8 22 C 6 8, 40 3, 70 5 S 99 18, 92 28 S 50 40, 24 36 S 2 26, 14 12" fill="none" stroke="var(--prune)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>';
const WAVE = '<svg class="wave" viewBox="0 0 400 22" preserveAspectRatio="none" aria-hidden="true"><path d="M0 12 C 50 2, 90 20, 140 11 S 230 3, 280 12 S 360 20, 400 9" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/></svg>';

const SEASON_NAMES = { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" };
function currentSeason() {
  const m = new Date().getMonth(); // northern hemisphere
  return m >= 2 && m <= 4 ? "spring" : m >= 5 && m <= 7 ? "summer" : m >= 8 && m <= 10 ? "fall" : "winter";
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function art(id) { return PLATES[id] ? PLATES[id]() : ""; }

function careNote(kind, title, inner) {
  return `<section class="note n-${kind}"><div class="ico" aria-hidden="true">${ICON[kind]}</div><div class="body"><h2>${title}${SWASH}</h2>${inner}</div></section>`;
}

function renderPlant(key, p) {
  const now = currentSeason();
  document.title = p.common + " · Balcony Plant Cards";
  const signs = list => (list || []).map(s => `<p class="sign">${esc(s)}</p>`).join("");
  return `
  <a class="back" href="#all"><span aria-hidden="true">←</span> All plants</a>
  <header class="head">
    <span class="where">${esc(p.where)}</span>
    <h1>${esc(p.common)}</h1>
    <p class="sci">${esc(p.sci)}</p>
  </header>

  <section class="pics${p.art.rest ? "" : " single"}" aria-label="What it looks like">
    <figure class="pic">${art(p.art.bloom)}<figcaption>${esc(p.bloomTitle || "In bloom")}<span>${esc(p.bloomNote)}</span></figcaption></figure>
    ${p.art.rest ? `<figure class="pic">${art(p.art.rest)}<figcaption>${esc(p.restTitle || "Not in bloom")}<span>${esc(p.restNote)}</span></figcaption></figure>` : ""}
  </section>

  ${WAVE}

  <div class="care">
    ${careNote("water", "Water", `<p class="lead">${esc(p.water.big)}</p><p>${esc(p.water.text)}</p>`)}
    ${careNote("sun", "Sun", `<p class="lead">${esc(p.sun.big)}</p><p>${esc(p.sun.text)}</p>`)}
    ${careNote("soil", "Soil mix", `<p class="mix">${p.soil.mix.map(m => `<b>${esc(m)}</b>`).join('<span class="plus">+</span>')}</p><p>${esc(p.soil.text)}</p>`)}
    ${careNote("feed", "Fertilize", `<p><span class="yes">${esc(p.feed.big)}</span>${esc(p.feed.text)}</p>`)}
    ${careNote("friend", "Can share a pot with", `<p>${esc(p.friends)}</p>`)}
    ${careNote("foe", "Don't pot with", `<p>${esc(p.foes)}</p>`)}
  </div>

  <section class="prune" aria-label="Pruning">
    <h2>${ICON.prune}Pruning</h2>
    <p class="how">${esc(p.pruneHow)}</p>
    ${p.pruneArt ? `<div class="snips">${p.pruneArt.map(([id]) => `<div class="snip">${art(id)}</div>`).join("")}</div>` : ""}
    <div class="seasons">
      ${Object.keys(SEASON_NAMES).map(s => `<div class="season"><h3>${SEASON_NAMES[s]}${s === now ? RING : ""}</h3>${s === now ? '<small>right now</small>' : ""}<p>${esc(p.seasons[s])}</p></div>`).join("")}
    </div>
  </section>

  <p class="foot"><a href="#all">← Back to all plants</a></p>`;
}

const KIND_WASH = { food: "var(--sun-bg)", pretty: "var(--friend-bg)" };
function thumb(id, kind) { BARE = true; WASH = KIND_WASH[kind]; const s = art(id); BARE = false; WASH = null; return s; }
let VIEW = "gallery", KIND = "all", SIDE = "all";
try { VIEW = localStorage.getItem("plantView") || "gallery"; KIND = localStorage.getItem("plantKind") || "all"; SIDE = localStorage.getItem("plantSide") || "all"; } catch (e) {}
function remember(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function setView(v) { VIEW = v; remember("plantView", v); route(); }
function setKind(v) { KIND = v; remember("plantKind", v); route(); }
function setSide(v) { SIDE = v; remember("plantSide", v); route(); }
const sideOf = p => p.where.toLowerCase().startsWith("west") ? "west" : "east";
function toggles(label, cur, fn, opts) {
  return `<div class="views" role="group" aria-label="${label}"><span class="vlabel">${label}</span>${opts.map(([v, txt], i) => `${i ? '<span aria-hidden="true">/</span>' : ""}<button type="button" id="${fn}-${v}" class="viewbtn${cur === v ? " on" : ""}" aria-pressed="${cur === v}" onclick="${fn}('${v}')">${txt}</button>`).join("")}</div>`;
}
function renderIndex() {
  document.title = "Balcony Plant Cards";
  const list = Object.entries(PLANTS).filter(([k, p]) => (KIND === "all" || p.kind === KIND) && (SIDE === "all" || sideOf(p) === SIDE));
  return `
  <header class="head"><span class="where">Both balconies</span><h1>Balcony plants</h1><p class="sci">Tap a plant, or scan its tag.</p></header>
  <div class="filters">
    ${toggles("Balcony", SIDE, "setSide", [["all", "Both"], ["east", "East"], ["west", "West"]])}
    ${toggles("Type", KIND, "setKind", [["all", "All"], ["food", `<i class="dot" style="background:var(--sun-bg)"></i>Food & herbs`], ["pretty", `<i class="dot" style="background:var(--friend-bg)"></i>Flowers & leafy`]])}
    ${toggles("Show as", VIEW, "setView", [["gallery", "Gallery"], ["list", "List"]])}
  </div>
  ${list.length ? `<nav class="index ${VIEW === "list" ? "as-list" : ""}">${list.map(([k, p]) => `<a href="#${k}"><span class="thumb">${thumb(p.art.bloom, p.kind)}</span><span class="names"><b>${esc(p.common)}</b><i>${esc(p.sci)}</i><small>${esc(p.where.split(" · ")[0])}</small></span></a>`).join("")}</nav>` : `<p class="sci">No plants match yet.</p>`}
  <p class="foot">Updated October 8, 2026</p>`;
}

function route() {
  const key = location.hash.slice(1).toLowerCase();
  const keys = Object.keys(PLANTS);
  const app = document.getElementById("app");
  app.innerHTML = PLANTS[key] ? renderPlant(key, PLANTS[key])
    : key === "all" ? renderIndex()
    : keys.length === 1 ? renderPlant(keys[0], PLANTS[keys[0]]) : renderIndex();
  fitDrawings(app);
  window.scrollTo(0, 0);
}
// trim each drawing's empty margins so it sits snugly under its heading
function fitDrawings(root) {
  root.querySelectorAll(".snip svg, .thumb svg").forEach(svg => {
    try {
      const b = svg.getBBox(), pad = 8;
      if (b.width && b.height) svg.setAttribute("viewBox", `${(b.x - pad).toFixed(1)} ${(b.y - pad).toFixed(1)} ${(b.width + pad * 2).toFixed(1)} ${(b.height + pad * 2).toFixed(1)}`);
    } catch (e) {}
  });
}
window.addEventListener("hashchange", route);
route();
</script>
