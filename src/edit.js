
// Pot editor: drag plants between pots (or tap a plant, then tap a pot), then Save.
// Saving writes pots.json to the repo through GitHub, using a key that lives only in this browser.
const REPO = "casacanfield/balcony-plants";
const FILE = "pots.json";
const API = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
const TOKEN_KEY = "potEditorToken";
const SITE = new URL("./", location.href).href;

let pots = {}, dirty = false, picked = null, showConnect = false;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } };
const setToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };
const sideOf = id => id.split("-")[0];
const numOf = id => parseInt(id.split("-")[1], 10) || 0;
const potName = id => (sideOf(id) === "west" ? "West " : "East ") + numOf(id);
const byName = (a, b) => PLANTS[a].common.localeCompare(PLANTS[b].common);
const sortPots = p => Object.fromEntries(Object.entries(p).sort(([a], [b]) => sideOf(a).localeCompare(sideOf(b)) || numOf(a) - numOf(b)));
const decode = b64 => decodeURIComponent(escape(atob(b64.replace(/\s/g, ""))));
const encode = str => btoa(unescape(encodeURIComponent(str)));
const toJson = p => "{\n" + Object.entries(p).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n";

function say(text, tone) { const m = $("#msg"); m.textContent = text; m.className = "msg" + (tone ? " " + tone : ""); }
function changed() { dirty = true; $("#save").disabled = false; say("Not saved yet"); render(); }

function chip(key, from, i) {
  const p = PLANTS[key];
  if (!p) return "";
  const on = picked && picked.from === from && picked.key === key && picked.i === i;
  return `<span class="chip ${p.kind === "food" ? "food" : ""}${on ? " picked" : ""}" data-key="${key}" data-from="${from}" data-i="${i}">${esc(p.common)}${from === "palette" ? "" : `<button type="button" class="x" aria-label="Take ${esc(p.common)} out of this pot">×</button>`}</span>`;
}

function potCard(id) {
  const list = pots[id];
  return `<section class="pot" data-pot="${id}" aria-label="${potName(id)}">
    <header><h3>${potName(id)}</h3>${list.length ? "" : `<button type="button" class="del" data-del="${id}">Remove pot</button>`}</header>
    <div class="plants">${list.length ? list.map((k, i) => chip(k, id, i)).join("") : `<span class="empty">Empty. Drop a plant here.</span>`}</div>
    <a class="link" href="${SITE}#${id}" target="_blank" rel="noopener">${esc((SITE + "#" + id).replace(/^https?:\/\//, ""))}</a>
  </section>`;
}

function render() {
  const token = getToken();
  const sides = [["east", "East balcony"], ["west", "West balcony"]];
  $("#app").innerHTML = `
  <a class="back" href="./#all">← All plants</a>
  <header><h1>What's in each pot</h1>
    <p class="hint">Drag a plant into a pot, or tap a plant and then tap a pot. Tap × to take a plant out. When you're done, tap Save. The tags show the change about a minute later.</p></header>
  <section aria-label="All plants">
    <h2>Plants</h2>
    <p class="hint">Drag from here to add a plant to a pot. It stays here too, so you can add it to more than one pot.</p>
    <div class="palette">${Object.keys(PLANTS).sort(byName).map(k => chip(k, "palette", -1)).join("")}</div>
  </section>
  ${sides.map(([side, title]) => `<section class="side" aria-label="${title}">
    <h2>${title}</h2>
    <div class="pots">${Object.keys(pots).filter(id => sideOf(id) === side).map(potCard).join("")}</div>
    <button type="button" class="addpot" data-add="${side}">+ New ${side} pot</button>
  </section>`).join("")}
  ${token && !showConnect ? `<p class="small">Connected to GitHub on this phone. <button type="button" id="disconnect">Disconnect</button></p>` : connectPanel()}`;
}

function connectPanel() {
  return `<section class="connect" id="connect" aria-label="Connect GitHub">
    <h2>Connect GitHub (one time)</h2>
    <p>Saving needs a key from your GitHub account, so only you can change the pots. You only do this once on each phone.</p>
    <ol>
      <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub's new key page</a> and sign in.</li>
      <li>Name it "pot editor" and set the expiry as long as it allows.</li>
      <li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick <b>balcony-plants</b>.</li>
      <li>Under <b>Permissions</b>, find <b>Contents</b> and set it to <b>Read and write</b>.</li>
      <li>Tap <b>Generate token</b>, copy it, and paste it below.</li>
    </ol>
    <div class="row"><input id="token" type="password" autocomplete="off" placeholder="Paste the key here" aria-label="GitHub key"><button type="button" id="savetoken">Connect</button></div>
    <p class="small">The key stays on this phone only. It can change this one project and nothing else on your GitHub.</p>
  </section>`;
}

// ---- moving plants ----
function drop(from, key, i, to) {
  if (from === to || !pots[to]) return;
  if (from !== "palette") pots[from].splice(i, 1);
  if (!pots[to].includes(key)) pots[to].push(key);
  picked = null;
  changed();
}

let drag = null;
document.addEventListener("pointerdown", e => {
  const c = e.target.closest(".chip");
  if (!c || e.target.closest(".x") || e.button > 0) return;
  drag = { c, x: e.clientX, y: e.clientY, on: false, ghost: null, over: null };
});
document.addEventListener("pointermove", e => {
  if (!drag) return;
  if (!drag.on) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return;
    drag.on = true;
    const r = drag.c.getBoundingClientRect();
    drag.dx = drag.x - r.left; drag.dy = drag.y - r.top;
    drag.ghost = drag.c.cloneNode(true);
    drag.ghost.classList.add("ghost");
    document.body.appendChild(drag.ghost);
  }
  e.preventDefault();
  drag.ghost.style.left = e.clientX - drag.dx + "px";
  drag.ghost.style.top = e.clientY - drag.dy + "px";
  const pot = document.elementFromPoint(e.clientX, e.clientY)?.closest(".pot");
  if (pot !== drag.over) { drag.over?.classList.remove("over"); pot?.classList.add("over"); drag.over = pot; }
  // scroll the page when dragging near the top or bottom edge
  const edge = 70;
  if (e.clientY < edge) scrollBy(0, -12); else if (e.clientY > innerHeight - edge - 70) scrollBy(0, 12);
}, { passive: false });
document.addEventListener("pointerup", e => {
  if (!drag) return;
  const d = drag; drag = null;
  const { key, from, i } = d.c.dataset;
  if (d.on) {
    d.ghost.remove(); d.over?.classList.remove("over");
    if (d.over) drop(from, key, +i, d.over.dataset.pot);
    return;
  }
  // a tap: pick this plant up, or put it down again
  picked = picked && picked.from === from && picked.key === key && picked.i === +i ? null : { from, key, i: +i };
  document.body.classList.toggle("wantsdrop", !!picked);
  render();
  if (picked) say(`Now tap the pot to put ${PLANTS[key].common} in`);
  else say(dirty ? "Not saved yet" : "");
});
document.addEventListener("pointercancel", () => { if (drag?.ghost) drag.ghost.remove(); drag?.over?.classList.remove("over"); drag = null; });

document.addEventListener("click", e => {
  const x = e.target.closest(".x");
  if (x) { const c = x.closest(".chip"); pots[c.dataset.from].splice(+c.dataset.i, 1); picked = null; changed(); return; }
  const del = e.target.closest("[data-del]");
  if (del) { delete pots[del.dataset.del]; changed(); return; }
  const add = e.target.closest("[data-add]");
  if (add) {
    const side = add.dataset.add;
    const n = Math.max(0, ...Object.keys(pots).filter(id => sideOf(id) === side).map(numOf)) + 1;
    pots = sortPots({ ...pots, [`${side}-${n}`]: [] });
    changed(); return;
  }
  const pot = e.target.closest(".pot");
  if (pot && picked && !e.target.closest(".chip, a, button")) { document.body.classList.remove("wantsdrop"); drop(picked.from, picked.key, picked.i, pot.dataset.pot); return; }
  if (e.target.id === "savetoken") {
    const t = $("#token").value.trim();
    if (!t) return;
    setToken(t); showConnect = false; render();
    if (dirty) save(); else say("Connected", "good");
    return;
  }
  if (e.target.id === "disconnect") { setToken(""); render(); say("Disconnected"); }
});

// ---- loading and saving ----
async function github(method, body) {
  const headers = { Accept: "application/vnd.github+json" };
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;
  if (body) headers["Content-Type"] = "application/json";
  const r = await fetch(API + (method === "GET" ? "?ref=main&t=" + Date.now() : ""), { method, headers, body: body && JSON.stringify(body), cache: "no-store" });
  if (!r.ok) throw Object.assign(new Error("GitHub " + r.status), { status: r.status });
  return r.json();
}

async function load() {
  try {
    pots = JSON.parse(decode((await github("GET")).content));
  } catch (e) {
    try { pots = await (await fetch(FILE, { cache: "no-cache" })).json(); } catch (e2) { pots = {}; say("Couldn't load the pots. Check your connection and reload.", "bad"); }
  }
  pots = sortPots(pots);
  render();
}

async function save() {
  if (!getToken()) {
    showConnect = true; render();
    $("#connect").scrollIntoView({ behavior: "smooth" });
    say("Connect GitHub first. It's a one-time step.");
    return;
  }
  const btn = $("#save");
  btn.disabled = true; say("Saving…");
  try {
    const { sha } = await github("GET");
    await github("PUT", { message: "Update pots from the pot editor", content: encode(toJson(pots)), sha, branch: "main" });
    dirty = false;
    say("Saved. The tags show the change in about a minute.", "good");
  } catch (e) {
    btn.disabled = false;
    if (e.status === 401 || e.status === 403 || e.status === 404) {
      setToken(""); showConnect = true; render();
      say("GitHub didn't accept the key. It may have expired or be missing Contents: Read and write. Connect again below.", "bad");
    } else say("Couldn't save. Check your connection and try again.", "bad");
  }
}

$("#save").addEventListener("click", save);
addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
load();
</script>
</body>
</html>
