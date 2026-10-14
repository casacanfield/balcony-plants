
// Pots view on the plant list: drag plants between pots (or tap a plant, then tap a pot), then Save.
// Saving writes pots.json to the repo through GitHub, using a key that lives only in this browser,
// so people scanning tags can look but not change anything.
const POTS_API = "https://api.github.com/repos/casacanfield/balcony-plants/contents/pots.json";
const TOKEN_KEY = "potEditorToken";
const SITE = new URL("./", location.href).href;
let potsDirty = false, picked = null, showConnect = false, potMsg = ["", ""];

const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } };
const setToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };
const potSide = id => id.split("-")[0];
const potNum = id => parseInt(id.split("-")[1], 10) || 0;
const potLabel = id => (potSide(id) === "west" ? "West " : "East ") + potNum(id);
const sortPots = p => Object.fromEntries(Object.entries(p).sort(([a], [b]) => potSide(a).localeCompare(potSide(b)) || potNum(a) - potNum(b)));
const potsJson = p => "{\n" + Object.entries(p).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n";
const b64encode = str => btoa(unescape(encodeURIComponent(str)));

function potChip(key, from, i) {
  const p = PLANTS[key];
  if (!p) return "";
  const on = picked && picked.from === from && picked.key === key && picked.i === i;
  return `<span class="chip ${p.kind === "food" ? "food" : ""}${on ? " picked" : ""}" data-key="${key}" data-from="${from}" data-i="${i}">${esc(p.common)}${from === "palette" ? "" : `<button type="button" class="x" aria-label="Take ${esc(p.common)} out of this pot">×</button>`}</span>`;
}

function potCard(id) {
  const list = POTS[id];
  return `<section class="pot" data-pot="${id}" aria-label="${potLabel(id)}">
    <header><h3>${potLabel(id)}</h3>${list.length ? "" : `<button type="button" class="del" data-del="${id}">Remove pot</button>`}</header>
    <div class="plants">${list.length ? list.map((k, i) => potChip(k, id, i)).join("") : `<span class="empty">Empty. Drop a plant here.</span>`}</div>
    <a class="link" href="#${id}">Tag link: ${esc((SITE + "#" + id).replace(/^https?:\/\//, ""))}</a>
  </section>`;
}

function potEditorInner() {
  const sides = [["east", "East balcony"], ["west", "West balcony"]].filter(([s]) => SIDE === "all" || SIDE === s);
  return `
  <p class="hint">Drag a plant into a pot, or tap a plant and then tap a pot. Tap × to take a plant out. Then tap Save.</p>
  <div class="palette" aria-label="All plants">${Object.keys(PLANTS).sort((a, b) => PLANTS[a].common.localeCompare(PLANTS[b].common)).map(k => potChip(k, "palette", -1)).join("")}</div>
  ${sides.map(([side, title]) => `<section class="side" aria-label="${title}">
    <h2>${title}</h2>
    <div class="pots">${Object.keys(POTS).filter(id => potSide(id) === side).map(potCard).join("")}</div>
    <button type="button" class="addpot" data-add="${side}">+ New ${side} pot</button>
  </section>`).join("")}
  ${getToken() && !showConnect ? `<p class="small">Saving is set up on this phone. <button type="button" id="disconnect">Turn off</button></p>` : connectPanel()}
  <div class="bar"><span class="msg ${potMsg[1]}" id="msg" role="status">${esc(potMsg[0])}</span><button type="button" class="save" id="save"${potsDirty ? "" : " disabled"}>Save changes</button></div>`;
}
function renderPotEditor() { return `<div class="poteditor" id="poteditor">${potEditorInner()}</div>`; }
function redrawPots() { const el = document.getElementById("poteditor"); if (el) el.innerHTML = potEditorInner(); }
function say(text, tone) { potMsg = [text, tone || ""]; const m = document.getElementById("msg"); if (m) { m.textContent = text; m.className = "msg " + (tone || ""); } }
function potsChanged() { potsDirty = true; potMsg = ["Not saved yet", ""]; redrawPots(); }

function connectPanel() {
  return `<section class="connect" id="connect" aria-label="Set up saving">
    <h2>Set up saving (one time)</h2>
    <p>Saving needs a key from your GitHub account, so only you can change the pots. You do this once on each phone.</p>
    <ol>
      <li>Open <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">GitHub's new key page</a> and sign in.</li>
      <li>Name it "pot editor" and set the expiry as long as it allows.</li>
      <li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick <b>balcony-plants</b>.</li>
      <li>Under <b>Permissions</b>, find <b>Contents</b> and set it to <b>Read and write</b>.</li>
      <li>Tap <b>Generate token</b>, copy it, and paste it below.</li>
    </ol>
    <div class="row"><input id="token" type="password" autocomplete="off" placeholder="Paste the key here" aria-label="GitHub key"><button type="button" id="savetoken">Done</button></div>
    <p class="small">The key stays on this phone. It can only change this plant site.</p>
  </section>`;
}

function dropPlant(from, key, i, to) {
  if (from === to || !POTS[to]) return;
  if (from !== "palette") POTS[from].splice(i, 1);
  if (!POTS[to].includes(key)) POTS[to].push(key);
  picked = null;
  document.body.classList.remove("wantsdrop");
  potsChanged();
}

let drag = null;
document.addEventListener("pointerdown", e => {
  const c = e.target.closest(".poteditor .chip");
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
  if (e.clientY < 70) scrollBy(0, -12); else if (e.clientY > innerHeight - 140) scrollBy(0, 12);
}, { passive: false });
document.addEventListener("pointerup", () => {
  if (!drag) return;
  const d = drag; drag = null;
  const { key, from, i } = d.c.dataset;
  if (d.on) {
    d.ghost.remove(); d.over?.classList.remove("over");
    if (d.over) dropPlant(from, key, +i, d.over.dataset.pot);
    return;
  }
  // a tap: pick this plant up, or put it down again
  picked = picked && picked.from === from && picked.key === key && picked.i === +i ? null : { from, key, i: +i };
  document.body.classList.toggle("wantsdrop", !!picked);
  potMsg = picked ? [`Now tap the pot to put ${PLANTS[key].common} in`, ""] : [potsDirty ? "Not saved yet" : "", ""];
  redrawPots();
});
document.addEventListener("pointercancel", () => { if (drag?.ghost) drag.ghost.remove(); drag?.over?.classList.remove("over"); drag = null; });

document.addEventListener("click", e => {
  if (!e.target.closest("#poteditor")) return;
  const x = e.target.closest(".x");
  if (x) { const c = x.closest(".chip"); POTS[c.dataset.from].splice(+c.dataset.i, 1); picked = null; potsChanged(); return; }
  const del = e.target.closest("[data-del]");
  if (del) { delete POTS[del.dataset.del]; potsChanged(); return; }
  const add = e.target.closest("[data-add]");
  if (add) {
    const side = add.dataset.add;
    const n = Math.max(0, ...Object.keys(POTS).filter(id => potSide(id) === side).map(potNum)) + 1;
    POTS = sortPots({ ...POTS, [`${side}-${n}`]: [] });
    potsChanged(); return;
  }
  const pot = e.target.closest(".pot");
  if (pot && picked && !e.target.closest(".chip, a, button")) { dropPlant(picked.from, picked.key, picked.i, pot.dataset.pot); return; }
  if (e.target.id === "save") { savePots(); return; }
  if (e.target.id === "savetoken") {
    const t = document.getElementById("token").value.trim();
    if (!t) return;
    setToken(t); showConnect = false; redrawPots();
    if (potsDirty) savePots(); else say("Saving is set up", "good");
    return;
  }
  if (e.target.id === "disconnect") { setToken(""); redrawPots(); }
});

async function github(method, body) {
  const headers = { Accept: "application/vnd.github+json", Authorization: "Bearer " + getToken() };
  if (body) headers["Content-Type"] = "application/json";
  const r = await fetch(POTS_API + (method === "GET" ? "?ref=main&t=" + Date.now() : ""), { method, headers, body: body && JSON.stringify(body), cache: "no-store" });
  if (!r.ok) throw Object.assign(new Error("GitHub " + r.status), { status: r.status });
  return r.json();
}

async function savePots() {
  if (!getToken()) {
    showConnect = true; potMsg = ["Saving needs a one-time setup, just below.", ""]; redrawPots();
    document.getElementById("connect").scrollIntoView({ behavior: "smooth" });
    return;
  }
  document.getElementById("save").disabled = true; say("Saving…");
  try {
    const { sha } = await github("GET");
    await github("PUT", { message: "Update pots from the plant list", content: b64encode(potsJson(POTS)), sha, branch: "main" });
    potsDirty = false;
    say("Saved. The tags show the change in about a minute.", "good");
  } catch (e) {
    document.getElementById("save").disabled = false;
    if (e.status === 401 || e.status === 403 || e.status === 404) {
      setToken(""); showConnect = true; potMsg = ["GitHub didn't accept the key. It may have expired. Set it up again below.", "bad"]; redrawPots();
    } else say("Couldn't save. Check your connection and try again.", "bad");
  }
}
addEventListener("beforeunload", e => { if (potsDirty) { e.preventDefault(); e.returnValue = ""; } });
